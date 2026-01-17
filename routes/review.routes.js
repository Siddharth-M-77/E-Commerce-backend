import express from "express";
import { addReview, deleteReview } from "../controllers/review.controller.js";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";

const router = express.Router();

router.route("/create").post(IsAuthenticated, addReview);

router.route("/delete").post(IsAuthenticated, deleteReview);

export default router;
