const express = require("express");

const User = require("../models/User");
const ClothingItem = require("../models/ClothingItem");
const SwapRequest = require("../models/SwapRequest");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Get admin dashboard data
router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();

      const totalListings =
        await ClothingItem.countDocuments();

      const activeSwaps =
        await SwapRequest.countDocuments({
          status: {
            $in: ["Pending", "Accepted"],
          },
        });

      const completedSwaps =
        await SwapRequest.countDocuments({
          status: "Completed",
        });

      const recentListings =
        await ClothingItem.find()
          .populate("owner", "name email location")
          .sort({ createdAt: -1 })
          .limit(5);

      res.status(200).json({
        stats: {
          totalUsers,
          totalListings,
          activeSwaps,
          completedSwaps,
        },

        recentListings,
      });
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while fetching admin dashboard data.",
      });
    }
  }
);

module.exports = router;