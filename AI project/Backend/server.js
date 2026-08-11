import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    // Allow local development, mobile devices on local network, and tools without origin
    callback(null, true);
  },
  credentials: true
}));

const PORT = process.env.PORT || 8000;

// Standard API Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Connect Database
connectDB();

// Server start
app.listen(PORT, () => {
  console.log(`AI Assistant Server is running on port ${PORT}`);
});
