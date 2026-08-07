import express from "express"
import { getCurrentUser, updateassistantname } from "../controllers/user.controller.js"
import isAuth from "../middlewares/isAuth.js"
import upload from "../middlewares/multer.js"

const userRouter = express.Router()

userRouter.get("/current", isAuth, getCurrentUser)
userRouter.post("/update", isAuth, upload.single("assistantImage"), updateassistantname)
userRouter.post("/updateassistantname", isAuth, upload.single("assistantImage"), updateassistantname)

export default userRouter
