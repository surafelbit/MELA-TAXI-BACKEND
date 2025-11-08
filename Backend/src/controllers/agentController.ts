import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
export const createAgent = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, outletName } = req.body;

    const requestingUser = req.user; // from auth middleware

    if (!requestingUser || requestingUser.role !== "ADMIN") {
      return res.status(403).json({ error: "Only Admin can create Agents" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const agentUser = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
        role: "AGENT",
        approved: true,
      },
    });
    await prisma.agent.create({
      data: {
        userId: agentUser.id,
        outletName,
      },
    });

    return res
      .status(201)
      .json({ message: "Agent created", agentId: agentUser.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
