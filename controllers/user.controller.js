import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../utils/mailer.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields missing",
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email & password required",
      });
    }

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.isLoginBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account blocked",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.lastLogin = new Date();
    await user.save();

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .status(200)
      .json({
        success: true,
        message: "Login Success",
        token,
        data: {
          role: user.role,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, phone } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (req.file) {
      updateData.profileImage = req.file.path; // Cloudinary URL
    }

    // If nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided to update",
      });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    console.log("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const contactUs = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    await transporter.sendMail({
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Contact Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">

            <!-- Header -->
            <div style="background: #111827; color: #ffffff; padding: 16px 20px;">
              <h2 style="margin: 0; font-size: 20px;">New Contact Us Message</h2>
            </div>

            <!-- Body -->
            <div style="padding: 20px;">
              <p style="margin-bottom: 16px; color: #374151;">
                You have received a new message from your website contact form.
              </p>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #111827;">Name</td>
                  <td style="padding: 8px; color: #374151;">${name}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 8px; font-weight: bold;">Email</td>
                  <td style="padding: 8px;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Phone</td>
                  <td style="padding: 8px;">${phone}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 8px; font-weight: bold;">Subject</td>
                  <td style="padding: 8px;">${subject}</td>
                </tr>
              </table>

              <div style="margin-top: 20px;">
                <p style="font-weight: bold; color: #111827; margin-bottom: 6px;">
                  Message
                </p>
                <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; color: #374151; line-height: 1.6;">
                  ${message.replace(/\n/g, "<br/>")}
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; padding: 12px 20px; text-align: center; font-size: 12px; color: #6b7280;">
              This message was sent from your website contact form.
            </div>

          </div>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact Email Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};


