import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    // ================= USER =================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      unique: true, // one cart per user
      required: true,
      index: true,
    },

    // ================= ITEMS =================
    items: [cartItemSchema],

    // ================= TOTAL =================
    totalItems: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    // ================= COUPON =================
    coupon: {
      code: { type: String, default: null },
      discountAmount: { type: Number, default: 0 },
    },

    // ================= STATUS =================
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ================= INDEX =================
cartSchema.index({ user: 1 });

const CartModel = mongoose.model("Cart", cartSchema);
export default CartModel;
