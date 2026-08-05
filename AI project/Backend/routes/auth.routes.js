import express from "express";
import { singup, login, logout } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post ("/signup", singup);
authRouter.post("/login", login);
authRouter.get("/logout", logout);

export default authRouter;