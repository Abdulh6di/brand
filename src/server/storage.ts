import { v2 as cloudinary } from "cloudinary";

export interface StorageProvider {
  uploadImage(buffer: Buffer, folder: string): Promise<{ url: string }>;
}

class CloudinaryStorage implements StorageProvider {
  private configured = false;

  private ensureConfigured() {
    if (this.configured) return;
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error("Image uploads are not configured on this environment.");
    }
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    this.configured = true;
  }

  uploadImage(buffer: Buffer, folder: string): Promise<{ url: string }> {
    this.ensureConfigured();
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: `aelia/${folder}` }, (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({ url: result.secure_url });
      });
      stream.end(buffer);
    });
  }
}

export const storageProvider: StorageProvider = new CloudinaryStorage();

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
