import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
export const getMyHistory = async (req: Request, res: Response) => {
  const user = req.user;
  try {
    const myId = req.user.id;
    const myHistory = await prisma.user.findUnique({
      where: { id: myId },
      include: {
        wallet: {
          include: { transactions: true },
          //   passenger: true,
          //  driver: true,
        },
      },
    });
    let history = [];

    if (user.role === "PASSENGER") {
      history = myHistory.wallet?.transactions || [];
    } else if (user.role === "DRIVER") {
      history = myHistory.wallet?.transactions || [];
    } else if (user.role === "AGENT") {
      history = myHistory.wallet?.transactions || [];
    } else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      // Admin view of all transactions
      history = await prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
      });
    }
    return res.status(200).json({
      history,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
};
export const getMyTrips = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const passenger = await prisma.passenger.findUnique({
      where: { userId: userId },
    });
    const passengerTrip = await prisma.tripPassenger.findMany({
      where: {
        passengerId: passenger.id,
      },
      include: {
        trip: {
          include: {
            vehicle: true,
            driver: { include: { user: true } },
          },
        },
      },
    });
    return res.status(200).json(passengerTrip);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};
