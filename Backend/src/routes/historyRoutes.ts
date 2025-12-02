import { Router } from "express";
import { getMyHistory, getMyTrips } from "../controllers/historyController";
const router = Router();
import { protect } from "../middleware/auth";
router.get("/my-history", protect([]), getMyHistory);
router.get("/my-trips", protect(["PASSENGER"]), getMyTrips);
export default router;
