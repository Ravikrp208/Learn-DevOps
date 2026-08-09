import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import geminiResponse from "./gemini.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));

const PORT = process.env.PORT || 8000;

app.use("/api/auth", authRouter);
app.use("/api/user",userRouter);


connectDB();
// Server initialization with Gemini AI integration
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
