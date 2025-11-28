import { Router } from "express";
import { receiveFairFromPassenger } from "../controllers/driverController";
import { protect } from "../middleware/auth";
const router = Router();
router.post("/receive-fair", protect(["DRIVER"]), receiveFairFromPassenger);
export default router;
