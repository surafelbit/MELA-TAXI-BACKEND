import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
const storage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // .jpg, .png
    const timestamp = Date.now(); // Current timestamp in ms

    cb(null, uuidv4() + timestamp); // Unique filename
  },
});
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: any
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};
export const upload = multer({ storage, fileFilter });
