import { Passenger } from "./../../node_modules/.prisma/client/index.d";
import { prisma } from "./../config/prisma";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
export async function receiveFairFromPassenger(req: Request, res: Response) {
  try {
    const driver = req.user;
    console.log(req.user);
    const vehicleId = req.user.plateNo;
    const driverId = driver.id;
    const driverInfo = await prisma.user.findUnique({
      where: { id: driverId },
      include: { wallet: true, driver: true },
    });

    const { qrCode, amount, routes } = req.body;
    const passenger = await prisma.passenger.findUnique({
      where: {
        qrCode: qrCode,
      },
      include: {
        user: { include: { wallet: true } },
      },
    });
    // const vehicle = await prisma.vehicle.findUnique({
    //   where: { plateNumber: vehicleId },
    // });
    // console.log(driverInfo?.driver?.id, "DRIVER INFO");
    console.log(vehicleId, "VEHICLE ID");
    const trip = await prisma.trip.create({
      data: {
        vehicleId: vehicleId,
        driverId: driverInfo?.driver?.id,
        route: routes,
      },
    });
    const tripPassenger = await prisma.tripPassenger.create({
      data: {
        tripId: trip.id,
        passengerId: passenger?.id,
        fare: amount,
      },
    });
    console.log(trip, "trip recorded");
    if (!passenger || !passenger.user?.wallet) {
      return res.status(404).json({ error: "Passenger or wallet not found" });
    }
    const wallet = passenger.user.wallet;

    const driverWallet = driverInfo?.wallet;
    const previousBalance = wallet.balance;
    const previousBalanceDriver = driverWallet?.balance;
    const newBalance = previousBalance - amount;
    const newBalanceDriver = previousBalanceDriver + amount;
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    const updateWalletDriver = await prisma.wallet.update({
      where: { id: driverWallet.id },
      data: { balance: newBalanceDriver },
    });
    const transaction = await prisma.transaction.create({
      data: {
        channel: "BANK_TRANSFER",

        walletId: wallet.id,
        type: "something",
        status: "SUCCESS",
        amount,
        previousBalance,
        newBalance,
        reference: uuid(),
      },
    });
    const transactionDriver = await prisma.transaction.create({
      data: {
        channel: "BANK_TRANSFER",
        walletId: driverWallet?.id,
        type: "something",
        status: "SUCCESS",
        amount,
        previousBalance: Number(previousBalanceDriver),
        newBalance: newBalanceDriver,
        reference: uuid(),
      },
    });
    return res.status(200).json({
      transactionDriver,
      transaction,
      updateWalletDriver,
      updatedWallet,
      trip,
      tripPassenger,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error,
    });
  }
}
