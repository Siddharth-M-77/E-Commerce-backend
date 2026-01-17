import UserModel from "../../models/user.model.js";

export const adminGetAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");

    res.status(200).json({
      success: true,
      total: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminToggleUserBlock = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isLoginBlocked = !user.isLoginBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${
        user.isLoginBlocked ? "blocked" : "unblocked"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
