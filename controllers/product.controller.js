import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import slugify from "slugify";
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      price,
      discountPrice,
      stock,
      category,
      images,
      thumbnail,
      metaTitle,
      metaDescription,
      sku,
      isFeatured,
    } = req.body;

    if (!title || !price || !stock || !category || !sku || !thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const slug = slugify(title, { lower: true });

    const productExists = await Product.findOne({ slug });
    if (productExists) {
      return res.status(409).json({
        success: false,
        message: "Product already exists",
      });
    }

    const product = await Product.create({
      title,
      slug,
      description,
      shortDescription,
      price,
      discountPrice,
      stock,
      category,
      images,
      thumbnail,
      metaTitle,
      metaDescription,
      sku,
      isFeatured,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const category = req.query.category;
    const minPrice = Number(req.query.minPrice) || 0;
    const maxPrice = Number(req.query.maxPrice) || 0;

    const query = {
      isActive: true,
      price: { $gte: minPrice },
    };

    if (maxPrice) {
      query.price.$lte = maxPrice;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({
      slug,
      isActive: true,
    }).populate("category", "name slug");

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
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.title) {
      updateData.slug = slugify(updateData.title, { lower: true });
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
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
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
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
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
