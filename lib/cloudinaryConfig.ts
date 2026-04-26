import { v2 as cloudinary } from "cloudinary";
import { myError } from "./myError";
import { consoleLoggingIntegration } from "@sentry/nextjs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type CloudinaryResult = {
  secure_url: string;
  public_id: string;
};

export async function uploadCloudinary(file: File): Promise<CloudinaryResult> {
  // On convertit l'image Buffer, c'est le format attendu par Node.js pour que Cloudinary puisse traiter l'image //
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "Socially" }, (error, result) => {
        if (error) reject(error);
        resolve(result!);
      })
      .end(buffer);
  });
}

export default async function deleteCloudinary(imagesId: string[]) {
  const result = await Promise.all(
    imagesId.map((id) =>
      cloudinary.uploader.destroy(id, { resource_type: "image" }),
    ),
  );

  if (!result) {
    throw new myError("Impossible supprimé cloudinary");
  }

  return true;
}
