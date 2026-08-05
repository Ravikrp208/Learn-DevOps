import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("database connected successfully");

    
  } catch (error) {
    console.error("database connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
