import { Router } from "express";
import {
  registerPassenger,
  loginUser,
  createAdmin,
  createAgent,
  createPhysicalQrPassenger,
  createDriver,
} from "../controllers/authController";
import { upload } from "../middleware/upload";
import { protect } from "../middleware/auth";
const router = Router();
router.post("/register", upload.single("photo"), registerPassenger); // passenger registration
router.post("/login", upload.single("photo"), loginUser);
router.post(
  "/create-admin",
  protect(["SUPER_ADMIN"]),
  upload.single("photo"),
  createAdmin
);
router.post(
  "/create-agent",
  protect(["SUPER_ADMIN", "ADMIN"]),
  upload.single("photo"),
  createAgent
);
router.post(
  "/create-manual-passenger",
  protect(["AGENT"]),
  upload.single("photo"),
  createPhysicalQrPassenger
);
router.post(
  "/create-driver",
  protect(["ADMIN"]),
  upload.single("photo"),
  createDriver
);
export default router;
