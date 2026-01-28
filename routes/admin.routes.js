import express from "express";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";
import { adminLogin, blockUser, getAllUsers } from "../controllers/admin.controller.js";

const router = express.Router();

router.route("/login").post(adminLogin);
router.route("/get-all-users").get(IsAuthenticated, getAllUsers);
router.route("/block-user/:id").get(IsAuthenticated, blockUser);

export default router;