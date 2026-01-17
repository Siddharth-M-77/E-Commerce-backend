import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

export const addReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, orderId, rating, title, comment } = req.body;

    if (!productId || !orderId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "All required fields missing",
      });
    }

    // ================= CHECK ORDER =================
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      orderStatus: "DELIVERED",
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "Only delivered orders can be reviewed",
      });
    }

    // ================= CHECK PRODUCT IN ORDER =================
    const orderedProduct = order.items.find(
      (i) => i.product.toString() === productId
    );

    if (!orderedProduct) {
      return res.status(400).json({
        success: false,
        message: "Product not found in order",
      });
    }

    // ================= DUPLICATE REVIEW =================
    const alreadyReviewed = await Review.findOne({
      user: userId,
      product: productId,
    });

    if (alreadyReviewed) {
      return res.status(409).json({
        success: false,
        message: "You already reviewed this product",
      });
    }

    // ================= CREATE REVIEW =================
    const review = await Review.create({
      user: userId,
      product: productId,
      order: orderId,
      rating,
      title,
      comment,
    });

    // ================= UPDATE PRODUCT RATING =================
    const reviews = await Review.find({ product: productId });

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      "ratings.average": avgRating.toFixed(1),
      "ratings.count": reviews.length,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Add Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      user: userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // ================= UPDATE PRODUCT RATING =================
    const reviews = await Review.find({ product: review.product });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    await Product.findByIdAndUpdate(review.product, {
      "ratings.average": avgRating.toFixed(1),
      "ratings.count": reviews.length,
    });

    res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    console.error("Delete Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
