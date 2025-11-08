import { Router } from "express";
import { Response, Request } from "express";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/prisma";
export const approvePassenger = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // request id
    const { reason } = req.body || {};
    const adminId = req.user.id; // from JWT
    const request = await prisma.passengerRequest.findUnique({
      where: {
        id,
      },
      include: { assignedAdmin: true, passenger: true },
    });
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.assignedAdminId !== adminId) {
      return res
        .status(403)
        .json({ error: "Not allowed to approve this request" });
    }
    const result = await prisma.passengerRequest.update({
      where: { id },
      data: {
        reason,
        status: "APPROVED",
        approvedById: adminId, // ✅ record who approved it
      },
    });
    const passengerRequest = await prisma.user.update({
      where: { id: request.passenger.userId },
      data: { approved: true, approvedBy: adminId },
      include: {
        passenger: true, // include the related passenger
      },
    });
    const qrCode = uuidv4();
    await prisma.passenger.update({
      where: { id: request.passenger.id },
      data: { qrCode },
    });
    const userId = passengerRequest.passenger.userId;

    await prisma.wallet.create({
      data: {
        userId: userId,
        balance: 0,
      },
    });
    return res.json({ message: "Passenger approved successfully", result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
export const depprovePassenger = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // request id
    const { reason } = req.body;
    const adminId = req.user.id; // from JWT
    const request = await prisma.passengerRequest.findUnique({
      where: {
        id,
      },
      include: { assignedAdmin: true, passenger: true },
    });
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.assignedAdminId !== adminId) {
      return res
        .status(403)
        .json({ error: "Not allowed to approve this request" });
    }
    const result = await prisma.passengerRequest.update({
      where: { id },
      data: {
        reason,
        status: "REJECTED",
        approvedById: adminId, // ✅ record who approved it
      },
    });

    return res.json({ message: "Passenger approved successfully", result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
export const getApproveNotification = async (req: Request, res: Response) => {
  try {
    const result = await prisma.passengerRequest.findMany();
  } catch (err) {}
};
