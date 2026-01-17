import Coupon from "../../models/coupon.model.js";

export const adminCreateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create({
      ...req.body,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      coupon,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
