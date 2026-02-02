import express from "express";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";
import { clearWishlist, getWishlist, moveToCart, toggleWishlist } from "../controllers/user.wishlist.controller.js";

const router = express.Router();

router.route("/toggle-wishlist/:productId").get(IsAuthenticated, toggleWishlist);
router.route("/get-wishlist").get(IsAuthenticated, getWishlist);
router.route("/clear-wishlist").delete(IsAuthenticated, clearWishlist);
router.route("/wishlist-to-cart/:productId").get(IsAuthenticated, moveToCart);

export default router;
