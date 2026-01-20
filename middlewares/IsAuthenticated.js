import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import Admin from "../models/admin.model.js";

const IsAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req?.cookies?.token;

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "You are not authenticated. Token missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await UserModel.findById(decoded.userId);
    if (!user) {
      user = await Admin.findById(decoded.id);
    }
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    req.user = user;
    if (user.role === "admin") {
      req.admin = user;
    }
    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(404).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default IsAuthenticated;
