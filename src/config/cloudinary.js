import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (fileStr, folder = "trendora/products") => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: folder,
      resource_type: "auto",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    };
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw new Error("Failed to upload image: " + err.message);
  }
};

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image: " + error.message);
  }
};

export const deleteMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error("Cloudinary bulk delete error:", error);
    throw new Error("Failed to delete images: " + error.message);
  }
};

export default cloudinary;
