// Catches anything a route passes to next(err) and turns it into a consistent
// JSON response. Registered last, after all routes.
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Schema rules broken, e.g. a missing required field or a bad enum value.
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  // A value could not be coerced to the schema type, e.g. a malformed ObjectId.
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid value for ${err.path}` });
  }

  // Unique index violation, currently only the email index on User.
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({ message: `That ${field} is already in use` });
  }

  // Malformed JSON body — thrown by express.json() before any route runs.
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON body" });
  }

  // Body larger than the configured limit.
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body too large" });
  }

  // Rejected by the upload middleware's file filter.
  if (err.code === "UNSUPPORTED_FILE_TYPE") {
    return res.status(415).json({ message: err.message });
  }

  // Raised by multer, most often when a file exceeds the size limit.
  if (err.name === "MulterError") {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ message: err.message });
  }

  // Cloudinary rejected the upload. A 4xx from Cloudinary means the file
  // itself was the problem (corrupted, unsupported content) — that is the
  // caller's fault, not ours, so it is reported as a 400. A 5xx means
  // Cloudinary's own infrastructure failed, which this server has no control
  // over, so it is reported as a 502.
  if (typeof err.http_code === "number") {
    if (err.http_code >= 400 && err.http_code < 500) {
      return res.status(400).json({ message: `Upload rejected: ${err.message}` });
    }
    return res.status(502).json({ message: "File storage service is currently unavailable" });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Something went wrong" });
}

function notFoundHandler(req, res) {
  return res.status(404).json({ message: `Route ${req.originalUrl} not found` });
}

module.exports = { errorHandler, notFoundHandler };
