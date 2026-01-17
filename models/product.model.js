import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // ================= BASIC INFO =================
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      default: "",
    },

    // ================= CATEGORY =================
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    // ================= PRICING =================
    price: {
      type: Number,
      required: true,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    discountPercent: {
      type: Number,
      default: 0,
    },

    // ================= STOCK =================
    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    sku: {
      type: String,
      unique: true,
      required: true,
    },

    // ================= MEDIA =================
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
      },
    ],

    thumbnail: {
      type: String,
      required: true,
    },

    // ================= RATINGS =================
    ratings: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    // ================= FLAGS =================
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isOutOfStock: {
      type: Boolean,
      default: false,
    },

    // ================= SEO =================
    metaTitle: {
      type: String,
      default: "",
    },

    metaDescription: {
      type: String,
      default: "",
    },

    // ================= ADMIN =================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

// ================= INDEXES =================
productSchema.index({ title: "text", description: "text" });
productSchema.index({ price: 1 });
productSchema.index({ category: 1, isActive: 1 });

const ProductModel = mongoose.model("Product", productSchema);
export default ProductModel;
