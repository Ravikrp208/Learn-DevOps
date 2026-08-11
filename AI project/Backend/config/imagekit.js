import ImageKit from "imagekit";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Initialize ImageKit instance
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLIC_API_KEY || "public_sample_key",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE_API_KEY || "private_sample_key",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/assistant"
});

// Upload image file to ImageKit
export const uploadImageKit = async (filepath, originalFilename = "avatar.jpg") => {
  try {
    if (!fs.existsSync(filepath)) {
      throw new Error(`File does not exist at path: ${filepath}`);
    }

    const fileBuffer = fs.readFileSync(filepath);
    const safeFilename = `${Date.now()}-${originalFilename.replace(/\s+/g, '_')}`;

    console.log(`Uploading file to ImageKit: ${safeFilename}...`);

    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: safeFilename,
      folder: "/virtual_assistant_avatars/",
      useUniqueFileName: true,
      tags: ["assistant", "avatar", "user_upload"]
    });

    console.log("ImageKit upload successful! URL:", uploadResponse.url);

    // Delete local temporary file after successful upload
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    return uploadResponse.url;
  } catch (error) {
    console.error("ImageKit upload error:", error.message || error);
    
    // Clean up local temp file on error
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
      } catch (e) {
        // ignore
      }
    }
    return null;
  }
};

// Direct buffer upload helper
export const uploadBufferToImageKit = async (buffer, filename = "image.jpg") => {
  try {
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: `${Date.now()}-${filename}`,
      folder: "/virtual_assistant_avatars/",
      useUniqueFileName: true
    });
    return uploadResponse.url;
  } catch (err) {
    console.error("ImageKit Buffer upload error:", err.message);
    return null;
  }
};

export default imagekit;
