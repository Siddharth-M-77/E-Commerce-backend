import express from "express";
const router = express.Router();

import {
  addToCart,
  getMyCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cart.controller.js";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";

router.use("/add", IsAuthenticated, addToCart);
router.use("/get", IsAuthenticated, getMyCart);
router.use("/remove", IsAuthenticated, removeFromCart);
router.use("/update", IsAuthenticated, updateCartItem);

export default router;
