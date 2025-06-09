import multer from "multer";
import path from "path";

// Configure storage for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/products/"); // Folder where images will be saved
  },
  filename: function (req, file, cb) {
    // Use timestamp + original filename to avoid collisions
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter,
});

export default upload;
