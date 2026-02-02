import WishlistModel from "../models/wishlist.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const toggleWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        let wishlist = await WishlistModel.findOne({ user: userId });

        // if wishlist does not exist → create
        if (!wishlist) {
            wishlist = await WishlistModel.create({
                user: userId,
                products: [productId],
            });

            return res.status(200).json({
                success: true,
                action: "added",
                message: "Product added to wishlist",
            });
        }

        const exists = wishlist.products.some(
            (id) => id.toString() === productId
        );

        if (exists) {
            wishlist.products = wishlist.products.filter(
                (id) => id.toString() !== productId
            );
        } else {
            wishlist.products.push(productId);
        }

        await wishlist.save();

        res.status(200).json({
            success: true,
            action: exists ? "removed" : "added",
            message: exists
                ? "Product removed from wishlist"
                : "Product added to wishlist",
        });
    } catch (error) {
        console.error("Toggle Wishlist Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const wishlist = await WishlistModel
            .findOne({ user: req.user._id })
            .populate({
                path: "products",
                select: "title discountPrice price discountPercent images isActive category ratings variants",
                populate: {
                    path: "category",
                    select: "name",
                },
            });

        res.status(200).json({
            success: true,
            wishlist: wishlist ? wishlist.products : [],
        });
    } catch (error) {
        console.error("Get Wishlist Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const clearWishlist = async (req, res) => {
    try {
        await WishlistModel.findOneAndUpdate(
            { user: req.user._id },
            { products: [] }
        );

        res.status(200).json({
            success: true,
            message: "Wishlist cleared",
        });
    } catch (error) {
        console.error("Clear Wishlist Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const moveToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, sku } = req.body;

        if (!productId || !sku) {
            return res.status(400).json({
                success: false,
                message: "Product and variant are required",
            });
        }

        // 1️⃣ Find wishlist
        const wishlist = await WishlistModel.findOne({ user: userId });
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found",
            });
        }

        const existsInWishlist = wishlist.products.some(
            (id) => id.toString() === productId
        );

        if (!existsInWishlist) {
            return res.status(400).json({
                success: false,
                message: "Product not in wishlist",
            });
        }

        // 2️⃣ Validate product + variant
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not available",
            });
        }

        const variant = product.variants.find((v) => v.sku === sku);
        if (!variant || variant.stock < 1) {
            return res.status(400).json({
                success: false,
                message: "Variant not available",
            });
        }

        // 3️⃣ Find or create cart
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
            if (cart.items[itemIndex].quantity + 1 > variant.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Stock limit exceeded",
                });
            }
            cart.items[itemIndex].quantity += 1;
        } else {
            cart.items.push({
                product: productId,
                variant: {
                    sku: variant.sku,
                    size: variant.size,
                    color: variant.color,
                },
                quantity: 1,
            });
        }

        // ✅ Cart save FIRST
        await cart.save();

        await WishlistModel.updateOne(
            { user: userId },
            { $pull: { products: productId } }
        );

        return res.status(200).json({
            success: true,
            message: "Product added to cart and removed from wishlist",
        });
    } catch (error) {
        console.error("Move To Cart Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};



