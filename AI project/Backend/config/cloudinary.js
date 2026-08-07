import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadCloudinary = async (filepath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    const uploadResult = await cloudinary.uploader.upload(filepath);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    return uploadResult.secure_url;
  } catch (error) {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    console.log("Cloudinary upload error:", error);
    return null;
  }
};

export default uploadCloudinary;