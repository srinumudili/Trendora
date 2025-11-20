import { deleteImage, uploadImage } from "../../config/cloudinary.js";

const uploadResolvers = {
  Mutation: {
    uploadImage: async (_, { file }, { user }) => {
      try {
        if (!user || user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        if (!file || !file.startsWith("data:image")) {
          throw new Error(
            "Invalid image file. Must be a base64 encoded image."
          );
        }

        const result = await uploadImage(file, "trendora/products");

        return {
          url: result.url,
          publicId: result.publicId,
        };
      } catch (error) {
        console.error("Upload error:", error);
        throw new Error("Failed to upload image: " + error.message);
      }
    },

    uploadMultipleImages: async (_, { files }, { user }) => {
      try {
        if (!user || user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        if (!files || files.length === 0) {
          throw new Error("No images provided");
        }

        if (files.length > 5) {
          throw new Error("Maximum 5 images allowed per upload");
        }

        for (const file of files) {
          if (!file.startsWith("data:image")) {
            throw new Error("Invalid image file format");
          }
        }

        const uploadPromises = files.map((file) => {
          return uploadImage(file, "trendora/products");
        });

        const results = await Promise.all(uploadPromises);

        return results.map((result) => ({
          url: result.url,
          publicId: result.publicId,
        }));
      } catch (error) {
        console.error("Multiple upload error:", error);
        throw new Error("Failed to upload images: " + error.message);
      }
    },

    deleteImage: async (_, { publicId }, { user }) => {
      try {
        if (!user || user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        if (!publicId) {
          throw new Error("Public ID is required");
        }

        const result = await deleteImage(publicId);

        if (result.result === "ok" || result.result === "not found") {
          return "Image deleted successfully";
        } else {
          throw new Error("Failed to delete image");
        }
      } catch (error) {
        console.error("Delete error:", error);
        throw new Error("Failed to delete image: " + error.message);
      }
    },
  },
};

export default uploadResolvers;
