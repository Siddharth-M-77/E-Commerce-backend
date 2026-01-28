import express from "express";
const router = express.Router();

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoriesForAdmin,
  toggleCategoryStatus,
} from "../controllers/category.controller.js";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";
import upload from "../middlewares/upload.js";

router.route("/add-category").post(upload.single("categoryImage"), IsAuthenticated, createCategory);
router.route("/get-categories").get(getCategories);
router.route("/get-categories-for-admin").get(IsAuthenticated, getCategoriesForAdmin);
router.route("/toggle-category/:id").get(IsAuthenticated, toggleCategoryStatus);
router.route("/delete-category/:id").delete(IsAuthenticated, deleteCategory);

export default router;
