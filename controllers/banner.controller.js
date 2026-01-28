import cloudinary from "../config/cloudinary.js";
import Banner from "../models/banner.model.js";

export const createBanner = async (req, res) => {
    try {
        const { tagline, title, description, isActive } = req.body;

        if (!tagline || !title || !description) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image is required",
            });
        }

        // 📸 Cloudinary Image
        const image = {
            public_id: req.file.filename,  // Cloudinary public_id
            url: req.file.path,            // Cloudinary URL
        };

        const banner = await Banner.create({
            tagline,
            title,
            description,
            image,
            isActive,
        });

        return res.status(201).json({
            success: true,
            banner,
        });

    } catch (error) {
        console.error("Create Banner Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


export const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });

        if (!banners) {
            return res.status(404).json({ success: false, message: "Banners not found" });
        }

        return res.status(200).json({ success: true, banners });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export const getBannersForAdmin = async (req, res) => {
    try {
        const banners = await Banner.find();

        if (!banners) {
            return res.status(404).json({ success: false, message: "Banners not found" });
        }

        return res.status(200).json({ success: true, banners });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findById(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found",
            });
        }

        // 🗑 Cloudinary se image delete
        if (banner.image?.public_id) {
            await cloudinary.uploader.destroy(banner.image.public_id);
        }

        // 🗑 DB se banner delete
        await Banner.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Banner & image deleted successfully",
        });

    } catch (error) {
        console.error("Delete Banner Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const toggleBannerStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await Banner.findById(id);

        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        banner.isActive = !banner.isActive;
        await banner.save();

        return res.status(200).json({ success: true, message: `Banner ${banner.isActive ? "enabled" : "disabled"} successfully` });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
}