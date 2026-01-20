import express from "express";
import { addAddress, deleteAddress, getMyAddresses, setDefaultAddress } from "../controllers/address.controller.js";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";

const router = express.Router();

router.route("/add-address").post(IsAuthenticated, addAddress);
router.route("/get-address").get(IsAuthenticated, getMyAddresses);
router.route("/delete-address/:addressId").delete(IsAuthenticated, deleteAddress);
router.route("/set-default-address/:addressId").get(IsAuthenticated, setDefaultAddress);

export default router;
