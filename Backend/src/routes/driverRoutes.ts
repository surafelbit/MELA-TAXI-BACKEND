import { Router } from "express";
import { getPassenger } from "../controllers/driverController";
const route = Router();
route.get("/get-passenger");
