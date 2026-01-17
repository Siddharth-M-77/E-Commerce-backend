import mongoose from "mongoose";

/* ================= ORDER ITEM SNAPSHOT ================= */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
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
    },

    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

/* ================= ORDER MAIN ================= */
const orderSchema = new mongoose.Schema(
  {
    // ================= USER =================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ================= ITEMS =================
    items: {
      type: [orderItemSchema],
      required: true,
    },

    // ================= ADDRESS =================
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    // ================= PAYMENT =================
    paymentMethod: {
      type: String,
      enum: ["COD", "RAZORPAY", "STRIPE"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },

    paymentId: {
      type: String,
      default: null,
    },

    // ================= PRICE =================
    subtotalAmount: {
      type: Number,
      required: true,
    },

    shippingFee: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    // ================= ORDER STATUS =================
    orderStatus: {
      type: String,
      enum: [
        "PLACED",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
      ],
      default: "PLACED",
      index: true,
    },

    // ================= TRACKING =================
    trackingNumber: {
      type: String,
      default: null,
    },

    courierPartner: {
      type: String,
      default: null,
    },

    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,

    // ================= ADMIN =================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ================= INDEX =================
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1 });

const OrderModel = mongoose.model("Order", orderSchema);
export default OrderModel;
