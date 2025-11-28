import { Router } from "express";
import { initializePayment } from "../controllers/paymentController";
const router = Router();
router.post("/initialize-payment", initializePayment);
export default router;
