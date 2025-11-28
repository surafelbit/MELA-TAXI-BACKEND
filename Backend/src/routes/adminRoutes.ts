import { Router } from "express";
import {
  approvePassenger,
  depprovePassenger,
  getApproveNotification,
} from "../controllers/adminController";
import { protect } from "../middleware/auth";
const router = Router();
// router.get("/get-approve-notification");
router.post(`/approve-passenger/:id`, protect(["ADMIN"]), approvePassenger);
router.post(`/depprove-passenger/:id`, protect(["ADMIN"]), depprovePassenger);
router.get(
  "/get-all-passenger-applicants",
  protect(["ADMIN"]),
  getApproveNotification
);
export default router;
