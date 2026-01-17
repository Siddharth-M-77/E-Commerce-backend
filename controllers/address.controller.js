import Address from "../models/address.model.js";

export const addAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      type,
      isDefault,
    } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "All required fields missing",
      });
    }

    // if new address is default, unset old default
    if (isDefault) {
      await Address.updateMany(
        { user: userId, isDefault: true },
        { isDefault: false }
      );
    }

    const address = await Address.create({
      user: userId,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      type,
      isDefault,
    });

    res.status(201).json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("Add Address Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getMyAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;

    const addresses = await Address.find({ user: userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Get Address Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;

    await Address.updateMany(
      { user: userId, isDefault: true },
      { isDefault: false }
    );

    const address = await Address.findOneAndUpdate(
      { _id: addressId, user: userId },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("Set Default Address Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;

    const address = await Address.findOneAndDelete({
      _id: addressId,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete Address Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
