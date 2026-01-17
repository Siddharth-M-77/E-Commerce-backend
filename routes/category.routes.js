import express from "express";
const router = express.Router();

import {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
} from "../controllers/category.controller.js";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";

router.route("/add").post(IsAuthenticated, createCategory);
router.route("/get-categories").get(IsAuthenticated, getCategories);
router.route("/get-categories-by-slug").get(IsAuthenticated, getCategoryBySlug);
router.route("/update").post(IsAuthenticated, updateCategory);

export default router;
