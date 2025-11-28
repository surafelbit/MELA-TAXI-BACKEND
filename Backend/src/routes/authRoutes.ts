import { Router } from "express";
import {
  registerPassenger,
  loginUser,
  createAdmin,
  createAgent,
  createPhysicalQrPassenger,
  createDriver,
  getMe,
} from "../controllers/authController";
import { uploadImage } from "../utils/uploadImage";
import { upload } from "../middleware/upload";
import { protect } from "../middleware/auth";
const router = Router();
router.post("/register", uploadImage("photo"), registerPassenger); // passenger registration
// router.post("/login", upload.single("photo"), loginUser);
router.post("/login", uploadImage("photo"), loginUser);
router.get("/get-me/:userId", protect([]), getMe);
router.post(
  "/create-admin",
  protect(["SUPER_ADMIN"]),
  uploadImage("photo"),
  createAdmin
);
router.post(
  "/create-agent",
  protect(["SUPER_ADMIN", "ADMIN"]),
  uploadImage("photo"),
  createAgent
);
router.post(
  "/create-manual-passenger",
  protect(["AGENT"]),
  uploadImage("photo"),
  createPhysicalQrPassenger
);
router.post(
  "/create-driver",
  protect(["ADMIN"]),
  uploadImage("photo"),
  createDriver
);
export default router;
