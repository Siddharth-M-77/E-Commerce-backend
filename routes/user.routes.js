import express from "express";

const router = express.Router();

import {
  getMyProfile,
  loginUser,
  registerUser,
} from "../controllers/user.controller.js";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/get-profile").get(IsAuthenticated, getMyProfile);

export default router;
