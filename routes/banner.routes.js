import express from "express";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";
import upload from "../middlewares/upload.js";
import { createBanner, deleteBanner, getBanners, getBannersForAdmin, toggleBannerStatus } from "../controllers/banner.controller.js";

const router = express.Router();

router.route("/create-banner").post(IsAuthenticated, upload.single("image"), createBanner);
router.route("/get-banners").get(getBanners);
router.route("/get-admin-banners").get(IsAuthenticated, getBannersForAdmin);
router.route("/delete-banner/:id").delete(IsAuthenticated, deleteBanner);
router.route("/toggle-banner/:id").get(IsAuthenticated, toggleBannerStatus);

export default router;