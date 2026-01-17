import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Address from "../models/address.model.js";
import Product from "../models/product.model.js";

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId, paymentMethod } = req.body;

    if (!addressId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Address & payment method required",
      });
    }

    // ================= CHECK ADDRESS =================
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
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

    // ================= STOCK CHECK =================
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.title}`,
        });
      }
    }

    // ================= CREATE ORDER =================
    const order = await Order.create({
      user: userId,
      items: cart.items,
      shippingAddress: addressId,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
      subtotalAmount: cart.totalAmount,
      totalAmount: cart.totalAmount,
      createdBy: userId,
    });

    // ================= REDUCE STOCK =================
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // ================= CLEAR CART =================
    cart.items = [];
    cart.totalItems = 0;
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({ user: userId })
      .populate("items.product", "title slug")
      .populate("shippingAddress")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    })
      .populate("items.product", "title slug")
      .populate("shippingAddress");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "PLACED") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled now",
      });
    }

    order.orderStatus = "CANCELLED";
    order.cancelledAt = new Date();
    await order.save();

    // ================= RESTORE STOCK =================
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
