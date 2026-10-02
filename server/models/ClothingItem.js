const mongoose = require("mongoose");

const clothingItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["shirts", "dresses", "jackets", "hoodies"],
    },

    size: {
      type: String,
      required: true,
      enum: ["S", "M", "L", "XL"],
    },

    condition: {
      type: String,
      required: true,
      enum: ["New", "Like New", "Excellent", "Good", "Fair"],
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ClothingItem = mongoose.model(
  "ClothingItem",
  clothingItemSchema
);

module.exports = ClothingItem;