import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // ================= RELATIONS =================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true, // ✅ verified buyer
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      default: "",
    },

    comment: {
      type: String,
      required: true,
    },

    // ================= MODERATION =================
    isApproved: {
      type: Boolean,
      default: true,
      index: true,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },

    // ================= META =================
    reviewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ================= INDEXES =================
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const ReviewModel = mongoose.model("Review", reviewSchema);
export default ReviewModel;
