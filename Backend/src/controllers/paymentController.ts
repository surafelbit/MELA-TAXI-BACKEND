import axios from "axios";
import express from "express";
import { Request, Response } from "express";
import { METHODS } from "http";
import { User } from "@prisma/client";
import { v4 as uuid } from "uuid";
import { getIO } from "../utils/socket";
import { prisma } from "../config/prisma";
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { trx_ref, status } = req.query;
    console.log(req.query, trx_ref, "forever");
    const result = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${trx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );
    console.log(
      result,
      "this is the result whatever it is gooing to be really long"
    );
    const user_id = (trx_ref as string).split("_")[1];
    console.log(user_id, "user id");
    if (result.data.data.status === "success") {
      // update wallet in DB
      console.log("succesffully paid");
      const user = await prisma.user.findUnique({ where: { id: user_id } });
      const existingTx = await prisma.transaction.findUnique({
        where: { reference: trx_ref }, // trx_ref comes from Chapa
      });

      if (existingTx) {
        return res.json({
          success: true,
          message: "Payment already processed",
          data: existingTx,
        });
      }
      const updateOfWallet = await prisma.wallet.update({
        where: { userId: user_id },
        data: {
          balance: { increment: result.data.data.amount || 0 }, // use actual amount
        },
      });
      console.log(updateOfWallet, "means the wallet is update");
      const transaction = await prisma.transaction.create({
        data: {
          walletId: updateOfWallet.id,
          type: result.data.data.type,
          channel: "CHAPA",
          amount: result.data.data.amount,
          createdBy: user_id,
          previousBalance: updateOfWallet.balance - result.data.data.amount,
          newBalance: updateOfWallet.balance,
          reference: trx_ref,
        },
      });
      const notification = await prisma.notification.create({
        data: {
          userId: user_id,
          title: "Wallet Top Up",
          message: `Your wallet has been credited with ${result.data.data.amount} birr.`,
        },
      });
      getIO()
        .to("ee5b7769-09cb-4f6e-a096-509e266ab6ea")
        .emit("payment-success", {
          amount: result.data.data.amount,
          newBalance: updateOfWallet.balance,
        });
      console.log("this also means transaction is also made", transaction);
      return res.status(200).json({
        success: true,
        message: "Payment verified and wallet updated",
        data: {
          amount: result.data.data.amount,
          newBalance: updateOfWallet.balance,
          transactionId: transaction.id,
        },
      });
    } else {
      console.log("i guess the payment is not succesffull");
    }
  } catch (err) {
    console.error(err, "this is the error on the payment verification");
    res.status(500).json({ error: err.message });
  }
};
export const initializePayment = async (req: Request, res: Response) => {
  try {
    console.log(req.user, "this is the attached user");

    const { amount, email, phone, fullName } = req.body;
    const randomLetter = Math.random().toString(36).substring(2, 10);
    const user_id = req.user.id;
    const tx_ref = randomLetter + "_" + user_id;
    const result = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount,
        currency: "ETB",
        email,
        first_name: fullName,
        tx_ref,
        callback_url: process.env.CHAPA_CALLBACK_URL,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    console.log(result.data?.data?.checkout_url);
    return res.json({
      checkout_url: result.data?.data?.checkout_url,
      // tx_ref,
    });
    // return res.json({
    //     checkout_url: results.data.checkout_url,
    //     tx_ref,
    //   });
  } catch (err) {
    console.log(err);
    console.log(err?.response?.data);
    return res.status(500).json({ error: "Payment initialization failed" });
  }
};
