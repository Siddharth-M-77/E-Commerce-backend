import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import Admin from "../models/admin.model.js";

const IsAuthenticated = async (req, res, next) => {
  try {
    console.log("Headers:", req.headers.authorization);
    console.log("Cookies:", req.cookie);

    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // 2️⃣ Cookie se token
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "You are not authenticated. Token missing.",
      });
    }

    // 🔐 Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 👤 Find User or Admin
    let user = await UserModel.findById(decoded.id);
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
