import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variant: {
      sku: {
        type: String,
        required: true,
      },
      size: {
        type: String,
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false, timestamps: true }
);


const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
      unique: true,
      index: true,
    },

    // -------- ITEMS --------
    items: {
      type: [cartItemSchema],
      default: [],
    },

    // -------- COUPON --------
    couponCode: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

cartSchema.index(
  { user: 1, "items.product": 1, "items.variant.sku": 1 },
  { unique: true, sparse: true }
);

const CartModel = mongoose.model("Cart", cartSchema);
export default CartModel;
