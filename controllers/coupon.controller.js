import Coupon from "../models/coupon.model.js";
import Cart from "../models/cart.model.js";
export const applyCoupon = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code required",
      });
    }

    // ================= GET CART =================
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // ================= FIND COUPON =================
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiryDate: { $gte: new Date() },
      startDate: { $lte: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired coupon",
      });
    }

    // ================= MIN CART VALUE =================
    if (cart.totalAmount < coupon.minCartValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart value ₹${coupon.minCartValue} required`,
      });
    }

    // ================= TOTAL USAGE LIMIT =================
    if (coupon.totalUsageLimit && coupon.usedCount >= coupon.totalUsageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit exceeded",
      });
    }

    // ================= PER USER LIMIT =================
    const usedByUser = coupon.usedBy.find((u) => u.user.toString() === userId);

    if (usedByUser && usedByUser.usedCount >= coupon.perUserLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon already used",
      });
    }

    // ================= CALCULATE DISCOUNT =================
    let discountAmount = 0;

    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (cart.totalAmount * coupon.discountValue) / 100;

      if (
        coupon.maxDiscountAmount &&
        discountAmount > coupon.maxDiscountAmount
      ) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // ================= APPLY TO CART =================
    cart.coupon = {
      code: coupon.code,
      discountAmount,
    };

    cart.totalAmount = cart.totalAmount - discountAmount;
    if (cart.totalAmount < 0) cart.totalAmount = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      cart,
    });
  } catch (error) {
    console.error("Apply Coupon Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const removeCoupon = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId });
    if (!cart || !cart.coupon?.code) {
      return res.status(400).json({
        success: false,
        message: "No coupon applied",
      });
    }

    // restore total
    cart.totalAmount += cart.coupon.discountAmount;
    cart.coupon = {
      code: null,
      discountAmount: 0,
    };

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Coupon removed successfully",
      cart,
    });
  } catch (error) {
    console.error("Remove Coupon Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
