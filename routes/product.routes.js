import express from "express";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";
import upload from "../middlewares/upload.js";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/product.controller.js";

const router = express.Router();

router.route("/create-product").post(IsAuthenticated, upload.array("images", 5), createProduct);
router.route("/get-products").get(IsAuthenticated, getProducts);
router.route("/update-product/:id").put(IsAuthenticated, upload.array("images", 5), updateProduct);
router.route("/delete-product/:id").delete(IsAuthenticated, deleteProduct);

export default router;
