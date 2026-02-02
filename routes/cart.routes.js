import express from "express";
import {
  addToCart,
  clearCart,
  getMyCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cart.controller.js";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";

const router = express.Router();

router.route("/add-to-cart").post(IsAuthenticated, addToCart);
router.route("/get-my-cart").get(IsAuthenticated, getMyCart);
router.route("/update-cart-item").put(IsAuthenticated, updateCartItem);
router.route("/remove-from-cart/:productId?/:sku").delete(IsAuthenticated, removeFromCart);
router.route("/clear-cart").delete(IsAuthenticated, clearCart);

export default router;
