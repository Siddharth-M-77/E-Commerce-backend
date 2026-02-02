import express from "express";
import {
  contactUs,
  getMyProfile,
  loginUser,
  registerUser,
  updateProfile,
} from "../controllers/user.controller.js";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/get-profile").get(IsAuthenticated, getMyProfile);
router.route("/update-profile").put(IsAuthenticated, upload.single("profileImage"), updateProfile);
router.route("/contact-us").post(contactUs);

export default router;
