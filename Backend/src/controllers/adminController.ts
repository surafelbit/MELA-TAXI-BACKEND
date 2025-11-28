import { Router } from "express";
import { Response, Request } from "express";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/prisma";
import QRCode from "qrcode";

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
    const passengerId = request.passenger.id;
    console.log(request.passenger.id, "american boy");
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.assignedAdminId !== adminId) {
      return res
        .status(403)
        .json({ error: "Not allowed to approve this request" });
    }
    const username = await prisma.passengerRequest.findUnique({
      where: { id },
      include: { passenger: true },
    });
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
    const qrCodeData = await QRCode.toDataURL(passengerId); // base64 string

    await prisma.passenger.update({
      where: { id: request.passenger.id },
      data: { qrCode: qrCode },
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
    const result = await prisma.passengerRequest.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        passenger: {
          include: {
            user: true,
          },
        },
        assignedAdmin: true,
      },
    });
    return res.status(200).json({
      result,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: err.message,
    });
  }
};
