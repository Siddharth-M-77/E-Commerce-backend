import mongoose from "mongoose";

const paymentLogSchema = new mongoose.Schema(
  {
    // ================= USER & ORDER =================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    // ================= PAYMENT GATEWAY =================
    gateway: {
      type: String,
      enum: ["RAZORPAY", "STRIPE", "PAYPAL"],
      required: true,
    },

    paymentId: {
      type: String,
      required: true,
      index: true,
    },

    signature: {
      type: String, // webhook verification
      default: null,
    },

    // ================= AMOUNT =================
    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // ================= STATUS =================
    status: {
      type: String,
      enum: ["CREATED", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED"],
      default: "CREATED",
      index: true,
    },

    // ================= RAW DATA =================
    gatewayResponse: {
      type: Object, // full webhook payload
      default: {},
    },

    // ================= REFUND =================
    refundId: {
      type: String,
      default: null,
    },

    refundedAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ================= INDEX =================
paymentLogSchema.index({ paymentId: 1, gateway: 1 });
paymentLogSchema.index({ order: 1, status: 1 });

const PaymentLogModel = mongoose.model("PaymentLog", paymentLogSchema);
export default PaymentLogModel;
