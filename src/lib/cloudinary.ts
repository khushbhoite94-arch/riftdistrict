import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  if (configured) return;

  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error("CLOUDINARY_CLOUD_NAME is missing");
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export async function uploadImage(
  file: File,
  folder = "riftdistrict/products"
): Promise<string> {
  ensureConfigured();

  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (err, result) => {
        if (err || !result) {
          reject(err ?? new Error("Cloudinary returned no result"));
          return;
        }
        resolve(result.secure_url);
      })
      .end(buffer);
  });
}
