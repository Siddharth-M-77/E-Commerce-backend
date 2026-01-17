import crypto from "crypto";
import Order from "../../models/order.model.js";
import PaymentLog from "../../models/paymentLog.model.js";

const verifyRazorpaySignature = (body, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");

  return expectedSignature === signature;
};

export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    // ================= VERIFY SIGNATURE =================
    const isValid = verifyRazorpaySignature(req.body, signature);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    // ================= PAYMENT CAPTURED =================
    if (event === "payment.captured") {
      const payment = payload.payment.entity;

      const paymentLog = await PaymentLog.findOne({
        paymentId: payment.id,
      });

      if (!paymentLog) {
        return res.status(404).json({ message: "Payment log not found" });
      }

      paymentLog.status = "CAPTURED";
      paymentLog.gatewayResponse = payload;
      await paymentLog.save();

      // ================= UPDATE ORDER =================
      const order = await Order.findById(paymentLog.order);
      if (order) {
        order.paymentStatus = "PAID";
        order.orderStatus = "CONFIRMED";
        order.paymentId = payment.id;
        await order.save();
      }
    }

    // ================= PAYMENT FAILED =================
    if (event === "payment.failed") {
      const payment = payload.payment.entity;

      const paymentLog = await PaymentLog.findOne({
        paymentId: payment.id,
      });

      if (paymentLog) {
        paymentLog.status = "FAILED";
        paymentLog.gatewayResponse = payload;
        await paymentLog.save();
      }
    }

    // ================= REFUND PROCESSED =================
    if (event === "refund.processed") {
      const refund = payload.refund.entity;

      const paymentLog = await PaymentLog.findOne({
        paymentId: refund.payment_id,
      });

      if (paymentLog) {
        paymentLog.status = "REFUNDED";
        paymentLog.refundId = refund.id;
        paymentLog.refundedAmount = refund.amount / 100;
        paymentLog.gatewayResponse = payload;
        await paymentLog.save();
      }
    }

    // Razorpay expects 200 always
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
