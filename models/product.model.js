import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
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

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    gender: {
      type: String,
      required: true,
      enum: ["men", "women", "unisex", "kids"],
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

    variants: [
      {
        size: {
          type: String,
          required: true,
          enum: ["XS", "S", "M", "L", "XL", "XXL"]
        },

        color: {
          type: String,
          required: true
        },

        stock: {
          type: Number,
          required: true,
          min: 0
        },

        sku: {
          type: String,
          required: true,
        }
      }
    ],

    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
        alt: { type: String, default: "" },
      },
    ],

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

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });
productSchema.index({ price: 1 });
productSchema.index({ category: 1, isActive: 1, gender: 1 });

const ProductModel = mongoose.model("Product", productSchema);
export default ProductModel;
