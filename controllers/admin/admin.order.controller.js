import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";

export const adminGetAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "username email")
      .populate("shippingAddress")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, courierPartner } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    if (status === "SHIPPED") {
      order.trackingNumber = trackingNumber;
      order.courierPartner = courierPartner;
      order.shippedAt = new Date();
    }

    if (status === "DELIVERED") {
      order.deliveredAt = new Date();
      order.paymentStatus = "PAID";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
