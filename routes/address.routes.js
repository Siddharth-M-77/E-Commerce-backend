import express from "express";
const router = express.Router();

import { addAddress } from "../controllers/address.controller.js";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";

router.use("/add", IsAuthenticated, addAddress);

export default router;
