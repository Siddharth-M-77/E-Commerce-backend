import express from "express";
const router = express.Router();

import { addAddress } from "../../controllers/address.controller.js";

router.route("/add").post(addAddress);

export default router;
