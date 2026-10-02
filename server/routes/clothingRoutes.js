const express = require("express");
const ClothingItem = require("../models/ClothingItem");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Get all available clothing items
router.get("/", async (req, res) => {
  try {
    const clothingItems = await ClothingItem.find({
      available: true,
    })
      .populate("owner", "name email location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      items: clothingItems,
    });
  } catch (error) {
    console.error("Get clothing error:", error.message);

    res.status(500).json({
      message: "Server error while fetching clothing listings.",
    });
  }
});

// Add Clothing Item
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      brand,
      category,
      size,
      condition,
      value,
      location,
      image,
    } = req.body;

    if (
      !title ||
      !brand ||
      !category ||
      !size ||
      !condition ||
      value === undefined ||
      !location ||
      !image
    ) {
      return res.status(400).json({
        message: "Please fill in all fields.",
      });
    }

    const clothingItem = await ClothingItem.create({
      title,
      brand,
      category,
      size,
      condition,
      value,
      location,
      image,
      owner: req.user.userId,
    });

    res.status(201).json({
      message: "Clothing listing added successfully!",
      item: clothingItem,
    });
  } catch (error) {
    console.error("Add clothing error:", error.message);

    res.status(500).json({
      message: "Server error while adding clothing.",
    });
  }
});

// Update Clothing Item
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const clothingItem = await ClothingItem.findById(
      req.params.id
    );

    if (!clothingItem) {
      return res.status(404).json({
        message: "Clothing item not found.",
      });
    }

    if (
      clothingItem.owner.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You can only update your own clothing listing.",
      });
    }

    const {
      title,
      brand,
      category,
      size,
      condition,
      value,
      location,
      image,
    } = req.body;

    clothingItem.title =
      title ?? clothingItem.title;

    clothingItem.brand =
      brand ?? clothingItem.brand;

    clothingItem.category =
      category ?? clothingItem.category;

    clothingItem.size =
      size ?? clothingItem.size;

    clothingItem.condition =
      condition ?? clothingItem.condition;

    clothingItem.value =
      value ?? clothingItem.value;

    clothingItem.location =
      location ?? clothingItem.location;

    clothingItem.image =
      image ?? clothingItem.image;

    await clothingItem.save();

    res.status(200).json({
      message:
        "Clothing listing updated successfully!",
      item: clothingItem,
    });
  } catch (error) {
    console.error(
      "Update clothing error:",
      error.message
    );

    res.status(500).json({
      message:
        "Server error while updating clothing.",
    });
  }
});

// Delete Clothing Item - Admin Only
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const clothingItem =
        await ClothingItem.findById(req.params.id);

      if (!clothingItem) {
        return res.status(404).json({
          message:
            "Clothing item not found.",
        });
      }

      await ClothingItem.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({
        message:
          "Clothing listing deleted successfully!",
      });
    } catch (error) {
      console.error(
        "Delete clothing error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while deleting clothing listing.",
      });
    }
  }
);

module.exports = router;