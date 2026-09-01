import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongoose connected to database");
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log("Please make sure MongoDB service is running locally on port 27017.");
    process.exit(1);
  }
};  

export default connectDB;
