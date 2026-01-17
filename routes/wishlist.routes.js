import express from "express";
const router = express.Router();

import { createCategory } from "../controllers/category.controller.js";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";

router.use("/add", IsAuthenticated, createCategory);

export default router;
