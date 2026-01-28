import express from "express";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";
import upload from "../middlewares/upload.js";
import { createProduct, deleteProduct, getProductsByCategory, getProductForAdmin, getProducts, updateProduct } from "../controllers/product.controller.js";

const router = express.Router();

router.route("/create-product").post(IsAuthenticated, upload.array("images", 5), createProduct);
router.route("/get-products-for-admin").get(IsAuthenticated, getProductForAdmin);
router.route("/get-products").get(getProducts);
router.route("/get-all-product/:category").get(getProductsByCategory);
router.route("/update-product/:id").put(IsAuthenticated, upload.array("images", 5), updateProduct);
router.route("/delete-product/:id").delete(IsAuthenticated, deleteProduct);

export default router;
