import { upload } from "../middleware/upload";

export const uploadImage = (fieldName: string) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err.message === "INVALID_FILE_TYPE") {
          return res.status(400).json({
            success: false,
            message: "Only image files are allowed",
          });
        }

        return res.status(500).json({
          success: false,
          message: "Upload failed",
          error: err.message,
        });
      }

      next();
    });
  };
};
