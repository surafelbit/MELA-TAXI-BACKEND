import { Router } from "express";
import {
  initializePayment,
  verifyPayment,
} from "../controllers/paymentController";
import { protect } from "../middleware/auth";
const router = Router();
router.post("/initialize-payment", protect([]), initializePayment);
router.get("/verify-payment", verifyPayment);
export default router;
