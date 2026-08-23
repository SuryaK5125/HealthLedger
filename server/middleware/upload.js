const multer = require("multer");

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

// Medical records are scans, photos and PDFs.
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];

// Files are held in memory and streamed straight to Cloudinary, so nothing
// untrusted is ever written to the server's filesystem. Safe because the size
// limit below bounds how much memory a single request can consume.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }
    const err = new Error(
      `Unsupported file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`
    );
    err.code = "UNSUPPORTED_FILE_TYPE";
    return cb(err);
  },
});

module.exports = {
  uploadSingleFile: upload.single("file"),
  MAX_FILE_BYTES,
  ALLOWED_MIME_TYPES,
};
