import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadCloudinary(file: File) {
  // On convertit l'image Buffer, c'est le format attendu par Node.js pour que Cloudinary puisse traiter l'image //
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "Socially" }, (error, result) => {
        if (error) reject(error);
        resolve(result);
      })
      .end(buffer);
  });
}
