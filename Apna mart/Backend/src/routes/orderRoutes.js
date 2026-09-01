import express from "express";
import { createOrder, getMyOrders } from "../controllers/orderController.js";
import { protect, optionalProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", optionalProtect, createOrder);
router.get("/myorders", protect, getMyOrders);

export default router;
