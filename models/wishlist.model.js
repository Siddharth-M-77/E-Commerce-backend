import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    // ================= USER =================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
      unique: true, // one wishlist per user
      index: true,
    },

    // ================= PRODUCTS =================
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

// ================= INDEX =================
wishlistSchema.index({ user: 1 });

const WishlistModel = mongoose.model("Wishlist", wishlistSchema);
export default WishlistModel;
