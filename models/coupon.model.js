import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    // ================= BASIC =================
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    // ================= DISCOUNT =================
    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FLAT"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
    },

    maxDiscountAmount: {
      type: Number,
      default: null, // percentage case
    },

    // ================= CONDITIONS =================
    minCartValue: {
      type: Number,
      default: 0,
    },

    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // ================= USAGE LIMIT =================
    totalUsageLimit: {
      type: Number,
      default: null, // unlimited
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    perUserLimit: {
      type: Number,
      default: 1,
    },

    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel" },
        usedCount: { type: Number, default: 1 },
      },
    ],

    // ================= VALIDITY =================
    startDate: {
      type: Date,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },

    // ================= STATUS =================
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ================= ADMIN =================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
  },
  { timestamps: true }
);

// ================= INDEX =================
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ expiryDate: 1 });

const CouponModel = mongoose.model("Coupon", couponSchema);
export default CouponModel;
