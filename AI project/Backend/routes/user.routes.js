import express from "express"
import {getCurrenUser} from "../controllers/user.controller.js"

const userRouter = express.Router()

userRouter.get("/current",getCurrenUser)

export default userRouter

