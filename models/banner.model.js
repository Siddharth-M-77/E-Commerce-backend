import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    tagline: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        public_id: String,
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Banner = new mongoose.model("Banner", bannerSchema);
export default Banner;