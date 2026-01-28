import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cookieParser from "cookie-parser";
import connectToDB from "./DB/DB.js";

/* ================= FILE PATH ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ================= ROUTES ================= */
// USER SIDE
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";

// ADMIN SIDE
import adminRoutes from "./routes/admin.routes.js";
import adminProductRoutes from "./routes/admin/admin.product.routes.js";
import adminOrderRoutes from "./routes/admin/admin.order.routes.js";
import adminUserRoutes from "./routes/admin/admin.user.routes.js";
import adminCouponRoutes from "./routes/admin/admin.coupon.routes.js";
import bannerRoutes from "./routes/banner.routes.js";

// PAYMENT WEBHOOK
import paymentRoutes from "./routes/payment.routes.js";

/* ================= APP INIT ================= */
const app = express();

/* ================= STATIC ================= */
app.use("/uploads", express.static(join(__dirname, "uploads")));

/* ================= CORS ================= */
const allowedOrigins = ["http://localhost:3005", "http://192.168.29.151:3005"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ================= PAYMENT WEBHOOK (RAW BODY) ================= */
/**
 * ⚠️ VERY IMPORTANT
 * Ye route JSON parser se pehle hona chahiye
 */
app.use(
  "/api/payment",
  express.raw({ type: "application/json" }),
  paymentRoutes
);
app.use(cookieParser());
/* ================= BODY PARSER ================= */
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

/* ================= LOGGER ================= */
app.use(morgan("dev"));

/* ================= API ROUTES ================= */

// 🔐 AUTH & USER
app.use("/api/users", userRoutes);

// 🛍️ USER E-COMMERCE
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/wishlist", wishlistRoutes);

// 🎉 BANNER
app.use("/api/banners", bannerRoutes);

// 🔐 ADMIN
app.use("/api/admin", adminRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/coupons", adminCouponRoutes);

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("🚀 E-commerce Backend Running");
});

/* ================= DB & SERVER ================= */
connectToDB()
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err);
    process.exit(1);
  });
