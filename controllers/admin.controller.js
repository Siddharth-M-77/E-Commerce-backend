import Admin from "../models/admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email & password required",
            });
        }

        const admin = await Admin.findOne({ email }).select("+password");
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Admin logged in successfully",
            admin,
            token,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        })
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find();

        if (!users) {
            return res.status(404).json({ success: false, message: "Users not found" });
        }

        return res.status(200).json({ success: true, users });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export const blockUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isLoginBlocked = !user.isLoginBlocked;
        await user.save();

        return res.status(200).json({ success: true, message: `User ${user.isLoginBlocked ? "blocked" : "unblocked"} successfully` });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
}