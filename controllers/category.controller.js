import cloudinary from "../config/cloudinary.js";
import Category from "../models/category.model.js";
import slugify from "slugify";

export const createCategory = async (req, res) => {
  try {
    let { name, slug, description, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (!slug) {
      slug = slugify(name, { lower: true });
    }

    const exists = await Category.findOne({ slug });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    let image = null;
    if (req.file) {
      image = {
        public_id: req.file.filename,   
        url: req.file.path,             
      };
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      isActive,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      category,
    });

  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getCategoriesForAdmin = async (req, res) => {
  try {
    const categories = await Category.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      slug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.name) {
      updateData.slug = slugify(updateData.name, { lower: true });
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      success: true,
      message: `Category ${category.isActive ? "enabled" : "disabled"
        } successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category & image deleted successfully",
    });

  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
