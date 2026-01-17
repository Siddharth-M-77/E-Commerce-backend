import express from "express";
const router = express.Router();

import { razorpayWebhook } from "../controllers/admin/webhook.controller.js";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";

router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  IsAuthenticated,
  razorpayWebhook
);

export default router;
