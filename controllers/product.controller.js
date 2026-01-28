import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import slugify from "slugify";
import cloudinary from "../config/cloudinary.js";

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discountPrice,
      category,
      variants,
      gender,
      isFeatured,
    } = req.body;

    if (!title || !price || !category || !variants?.length || !gender) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const variant = JSON.parse(req.body.variants);

    // Images from Cloudinary
    const images = req.files?.map(file => ({
      public_id: file.filename,
      url: file.path,
      alt: title
    }));

    if (!images?.length) {
      return res.status(400).json({
        success: false,
        message: "Product images are required",
      });
    }

    // Check category
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Slug
    const slug = slugify(title, { lower: true });

    const productExists = await Product.findOne({ slug });
    if (productExists) {
      return res.status(409).json({
        success: false,
        message: "Product already exists",
      });
    }

    // Validate variants
    for (let v of variant) {
      if (!v.size || !v.color || !v.stock || !v.sku) {
        return res.status(400).json({
          success: false,
          message: "Each variant must have size, color, stock, and sku",
        });
      }
    }

    // Create product
    const product = await Product.create({
      title,
      slug,
      description,
      gender,
      price,
      discountPrice,
      category,
      images,
      variants: variant,
      isFeatured,
      createdBy: req.user.id,
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

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const product = await Product.find({
      category,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

export const getProductForAdmin = async (req, res) => {
  try {
    const product = await Product.find().populate("category", "name slug");

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
    let updateData = req.body;

    // Slug update
    if (updateData.title) {
      updateData.slug = slugify(updateData.title, { lower: true });
    }

    // Parse variants (FormData se string aata hai)
    if (updateData.variants) {
      updateData.variants = JSON.parse(updateData.variants);
    }

    // Find existing product
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Handle images
    let images = existingProduct.images;

    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        public_id: file.filename,
        url: file.path,
        alt: updateData.title || existingProduct.title
      }));
    }
    updateData.images = images;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
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
      message: `Product ${product.isActive ? "enabled" : "disabled"
        } successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product & images deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


