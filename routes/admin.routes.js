import express from "express";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";
import { adminLogin } from "../controllers/admin.controller.js";

const router = express.Router();

router.route("/login").post(adminLogin);

export default router;