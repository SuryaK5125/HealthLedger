const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const FOLDER = "healthledger/records";

function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

// The SDK's stream API is the only way to upload a buffer without first
// writing it to disk, so wrap it in a promise.
function uploadBuffer(buffer, { folder = FOLDER } = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

// Deleting an asset that is already gone is treated as success, which makes a
// failed delete safe to retry.
async function deleteAsset(publicId, resourceType = "image") {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });

  if (result.result === "ok" || result.result === "not found") {
    return result;
  }
  throw new Error(`Cloudinary delete failed: ${result.result}`);
}

module.exports = { cloudinary, uploadBuffer, deleteAsset, isConfigured };
