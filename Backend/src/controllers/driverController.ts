import { Passenger } from "./../../node_modules/.prisma/client/index.d";
import { prisma } from "./../config/prisma";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
export async function receiveFairFromPassenger(req: Request, res: Response) {
  try {
    const driver = req.user;
    const driverId = driver.id;
    const { qrCode, amount } = req.body;
    const passenger = await prisma.passenger.findUnique({
      where: {
        qrCode: qrCode,
      },
      include: {
        user: { include: { wallet: true } },
      },
    });

    if (!passenger || !passenger.user?.wallet) {
      return res.status(404).json({ error: "Passenger or wallet not found" });
    }
    const wallet = passenger.user.wallet;
    const driverWallet = driver.user.wallet;
    const previousBalance = wallet.balance;
    const previousBalanceDriver = driverWallet.balance;
    const newBalance = previousBalance + amount;
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
        walletId: wallet.id,
        status: "SUCCESS",
        amount,
        previousBalance,
        newBalance,
        reference: uuid(),
      },
    });
    const transactionDriver = await prisma.transaction.create({
      data: {
        wallet: driverWallet.id,
        status: "SUCCESS",
        amount,
        previousBalance: previousBalanceDriver,
        newBalance: newBalanceDriver,
        reference: uuid(),
      },
    });
  } catch (error) {}
}
