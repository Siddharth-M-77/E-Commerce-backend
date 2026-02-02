import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const getMyCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId })
      .populate("items.product", "title slug images price discountPercent");

    if (cart?.items?.length) {
      cart.items.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

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

    let totalItems = 0;
    let totalAmount = 0;

    const items = cart.items.map((item) => {
      const product = item.product;
      const price = product.finalPrice || product.price;
      const subtotal = price * item.quantity;

      totalItems += item.quantity;
      totalAmount += subtotal;

      return {
        productId: product._id,
        title: product.title,
        slug: product.slug,
        image: product.images?.[0]?.url || "",
        variant: item.variant,
        quantity: item.quantity,
        price,
        subtotal,
      };
    });

    res.status(200).json({
      success: true,
      cart: {
        items,
        totalItems,
        totalAmount,
      },
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, sku, quantity } = req.body;

    if (!productId || !sku || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid product, variant or quantity",
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not available",
      });
    }

    const variant = product.variants.find((v) => v.sku === sku);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    if (variant.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (i) =>
        i.product.toString() === productId &&
        i.variant.sku === sku
    );

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + quantity;
      if (newQty > variant.stock) {
        return res.status(400).json({
          success: false,
          message: "Stock limit exceeded",
        });
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      cart.items.push({
        product: productId,
        variant: {
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
        },
        quantity,
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart",
    });
  } catch (error) {
    console.error("Add To Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, sku, quantity } = req.body;

    if (!productId || !sku || quantity < 1) {
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

    const product = await Product.findById(productId);
    const variant = product?.variants.find((v) => v.sku === sku);

    if (!variant || quantity > variant.stock) {
      return res.status(400).json({
        success: false,
        message: "Invalid or insufficient stock",
      });
    }

    const item = cart.items.find(
      (i) =>
        i.product.toString() === productId &&
        i.variant.sku === sku
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not in cart",
      });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart updated",
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, sku } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (i) =>
        !(
          i.product.toString() === productId &&
          i.variant.sku === sku
        )
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Remove Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

