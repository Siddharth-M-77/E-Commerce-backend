import Product from "../../models/product.model.js";
import slugify from "slugify";

export const adminGetAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminCreateProduct = async (req, res) => {
  try {
    const { title, category, price, stock, sku, thumbnail } = req.body;

    if (!title || !category || !price || !stock || !sku || !thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const slug = slugify(title, { lower: true });

    const exists = await Product.findOne({ slug });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Product already exists",
      });
    }

    const product = await Product.create({
      ...req.body,
      slug,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Admin Create Product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminUpdateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const data = req.body;

    if (data.title) {
      data.slug = slugify(data.title, { lower: true });
    }

    const product = await Product.findByIdAndUpdate(productId, data, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminToggleProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${
        product.isActive ? "enabled" : "disabled"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
