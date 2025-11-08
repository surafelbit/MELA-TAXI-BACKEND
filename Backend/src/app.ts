import express from "express";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "../src/routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
dotenv.config();

const app = express();
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"))); // serve uploaded images

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

export default app;
