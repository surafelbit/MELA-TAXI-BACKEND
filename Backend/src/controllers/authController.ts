import { PhysicalCard } from "./../../node_modules/.prisma/client/index.d";
import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Role } from "@prisma/client";
import { json } from "stream/consumers";
const getNextAdmin = async (): Promise<{ id: string; fullName: string }> => {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });

  if (!admins.length) throw new Error("No admins available");

  const lastNotification = await prisma.notification.findFirst({
    where: { title: "Passenger Registration" },
    orderBy: { createdAt: "desc" },
    select: { userId: true },
  });

  if (!lastNotification) return admins[0];

  const lastIndex = admins.findIndex((a) => a.id === lastNotification.userId);
  return admins[(lastIndex + 1) % admins.length];
};
export const registerPassenger = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let photoUrl: string | null = null;
    if (req.file) {
      photoUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
        role: Role.PASSENGER,
        photoUrl,
        approved: false,
      },
    });
    const assignedAdmin = await getNextAdmin();
    let qrCode = "";
    const passenger = await prisma.passenger.create({
      data: {
        qrCode,
        userId: user.id,
        isDigital: true,
      },
    });

    const request = await prisma.passengerRequest.create({
      data: {
        passengerId: passenger.id,
        assignedAdminId: assignedAdmin.id,
        status: "PENDING",
      },
    });

    // 6) Send Notification
    await prisma.notification.create({
      data: {
        userId: assignedAdmin.id,
        title: "Passenger Approval Needed",
        message: `Review passenger: ${user.fullName}`,
      },
    });

    return res.status(201).json({
      message: "Passenger registration submitted for approval",
      requestId: request.id,
      assignedAdmin: assignedAdmin.fullName,
      status: request.status,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { phone, password, email, fullName } = req.body;
    const requestingUser = req.user; // from auth middleware

    if (!requestingUser || requestingUser.role !== "SUPER_ADMIN") {
      return res
        .status(403)
        .json({ error: "Only Super Admin can create Admins" });
    }
    if (!fullName || !phone || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (password.length < 4) {
      return res
        .status(400)
        .json({ error: "Password must be at least 4 characters long" });
    }
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or phone already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let photoUrl: string | null = null;
    if (req.file) {
      photoUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    }
    const admin = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
        approvedBy: req.user.id,
        role: Role.ADMIN,
        photoUrl,
        approved: true,
      },
    });
    return res
      .status(201)
      .json({ message: "Admin created", adminId: admin.id });
  } catch (err) {}
};
export const createDriver = async (req: Request, res: Response) => {
  try {
    const { phone, password, email, fullName, plateNumber } = req.body;
    if (password.length < 4) {
      return res
        .status(404)
        .json({ message: "Password Must Be Longer Than 4" });
    }
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ phone }, { email }] },
    });
    if (existingUser) {
      return res
        .status(404)
        .json({ message: "User Exist By That Email or Phone" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const creatorId = req.user.id; // whoever is logged in (admin)
    let photoUrl: string | null = null;
    if (req.file) {
      photoUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    }
    const user = await prisma.user.create({
      data: {
        fullName,

        password: hashedPassword,
        phone,
        email,
        photoUrl,
        role: Role.DRIVER,
        registeredBy: creatorId,
        approved: true,
      },
    });
    const driver = await prisma.driver.create({
      data: { userId: user.id },
    });
    const vehicle = await prisma.vehicle.create({
      data: { driverId: driver.id, plateNumber },
    });
    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
      },
    });
    return res.status(201).json({
      message: "Driver registered successfully",
      user,
      driver,
      vehicle,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};
export const createAgent = async (req: Request, res: Response) => {
  try {
    const { phone, password, email, fullName } = req.body;

    const requestingUser = req.user;
    console.log(requestingUser.role);
    if (
      !requestingUser ||
      (requestingUser.role !== "SUPER_ADMIN" && requestingUser.role !== "ADMIN")
    ) {
      return res
        .status(403)
        .json({ error: "Only Super Admin and Admins can create Agent" });
    }
    if (!fullName || !phone || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (password.length < 4) {
      return res
        .status(400)
        .json({ error: "Password must be at least 4 characters long" });
    }
    if (existingUser) {
      res.status(400).json({
        error: "The Email or Phone Number Already Exist",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let photoUrl: string | null = null;

    if (req.file) {
      photoUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    }
    const creator = req.user.id;
    const agent = await prisma.user.create({
      data: {
        fullName,
        password: hashedPassword,
        phone,
        email,
        photoUrl,
        registeredBy: creator,
        role: Role.AGENT,
        approved: true,
      },
    });
    return res
      .status(201)
      .json({ message: "Agent created", agentId: agent.id });
  } catch (err) {
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Phone and password required" });
    }
    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        passenger: {
          include: {
            requests: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (user.passenger) {
      const latestRequest = user.passenger.requests[0];
      if (latestRequest) {
        if (latestRequest.status === "PENDING") {
          return res
            .status(403)
            .json({ error: "Your account is pending approval." });
        }
        if (latestRequest.status === "REJECTED") {
          return res
            .status(403)
            .json({ error: "Your account has been rejected." });
        }
      }
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // JWT payload
    const payload = {
      id: user.id,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const createPhysicalQrPassenger = async (
  req: Request,
  res: Response
) => {
  try {
    const { fullName, phone, password } = req.body;
    const requestingUser = req.user;
    if (!requestingUser || requestingUser.role !== "AGENT") {
      return res
        .status(403)
        .json({ error: "Only Agents  can create passengers" });
    }
    if (!fullName || !phone || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const existingUser = await prisma.user.findFirst({
      where: { phone },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or phone already registered" });
    }
    if (password.length < 4) {
      return res
        .status(400)
        .json({ error: "Password must be at least 4 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let photoUrl: string | null = null;

    if (req.file) {
      photoUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    }
    const assignedAdmin = await getNextAdmin();
    const qrCode = uuidv4();
    const PhysicalCardUser = await prisma.user.create({
      data: {
        fullName,
        password: hashedPassword,
        phone,
        role: Role.PASSENGER,
        photoUrl,
        approved: false,
      },
    });
    const PhysicalCardPassanger = await prisma.passenger.create({
      data: {
        userId: PhysicalCardUser.id,
        isDigital: false,
        qrCode,
      },
    });
    const request = await prisma.passengerRequest.create({
      data: {
        passengerId: PhysicalCardPassanger.id,
        assignedAdminId: assignedAdmin.id,
        status: "PENDING",
      },
    });
    await prisma.notification.create({
      data: {
        userId: assignedAdmin.id,
        title: "Passenger Approval Needed",
        message: `Review passenger: ${PhysicalCardUser.fullName}`,
      },
    });

    await prisma.wallet.create({
      data: {
        userId: PhysicalCardUser.id,
        balance: 0,
      },
    });
    return res.status(201).json({
      message: "Passenger registered successfully, approval request sent.",
      userId: PhysicalCardUser.id,
      passengerId: PhysicalCardPassanger.id,
      assignedAdmin: assignedAdmin.fullName,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
