import multer from "multer";
import BadRequestError from "../utils/errors/bad-request-error.js";

/**
 * Configure Multer storage and file handling
 * This setup includes:
 * - Disk storage configuration with unique filenames
 * - File size limits (5MB max)
 * - File type validation
 * - Custom error handling
 */

// Define allowed mime types for different file categories
const mimeTypes = {
  image: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
  resume: [
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ],
};

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

// Configure file filter to validate file types
const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Invalid file type"), false);
  }
};

// Configure multer with custom error handling
const uploadConfig = (type) => {
  if (!mimeTypes[type]) {
    throw new Error(`Invalid upload type: ${type}`);
  }

  return multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter(mimeTypes[type]),
  }).single("file"); // Accept single file upload with field name 'file'
};

// Error handling middleware for multer errors
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new BadRequestError("File size exceeds 5MB limit"));
    }
    return next(new BadRequestError(err.message));
  }
  next(err);
};

export const upload = uploadConfig;
