import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const getMyCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "title slug"
    );
    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          totalItems: 0,
          totalAmount: 0,
        },
      });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid product or quantity",
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not available",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    const price =
      product.discountPrice > 0 ? product.discountPrice : product.price;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].subtotal = cart.items[itemIndex].quantity * price;
    } else {
      cart.items.push({
        product: productId,
        title: product.title,
        image: product.thumbnail,
        price,
        quantity,
        subtotal: price * quantity,
      });
    }

    // ===== recalc totals =====
    cart.totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.subtotal, 0);
    await cart.save();

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Add To Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
    if (!productId || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
      });
    }
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    const item = cart.items.find((i) => i.product.toString() === productId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not in cart",
      });
    }

    item.quantity = quantity;
    item.subtotal = item.price * quantity;

    cart.totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.subtotal, 0);

    await cart.save();

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);

    cart.totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, i) => sum + i.subtotal, 0);

    await cart.save();

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Remove Cart Item Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
