const express = require("express");
const SwapRequest = require("../models/SwapRequest");
const ClothingItem = require("../models/ClothingItem");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a swap request
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      itemId,
      offeredItemId,
      message,
    } = req.body;

    if (!itemId || !offeredItemId) {
      return res.status(400).json({
        message: "Please select both items for the swap.",
      });
    }

    if (itemId === offeredItemId) {
      return res.status(400).json({
        message: "You cannot swap an item with itself.",
      });
    }

    const requestedItem = await ClothingItem.findById(itemId);
    const offeredItem = await ClothingItem.findById(
      offeredItemId
    );

    if (!requestedItem) {
      return res.status(404).json({
        message: "Requested clothing item not found.",
      });
    }

    if (!offeredItem) {
      return res.status(404).json({
        message: "Offered clothing item not found.",
      });
    }

    if (!requestedItem.available) {
      return res.status(400).json({
        message: "The requested item is no longer available.",
      });
    }

    if (!offeredItem.available) {
      return res.status(400).json({
        message: "Your offered item is no longer available.",
      });
    }

    if (
      requestedItem.owner.toString() === req.user.userId
    ) {
      return res.status(400).json({
        message: "You cannot request a swap for your own item.",
      });
    }

    if (
      offeredItem.owner.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You can only offer your own clothing item.",
      });
    }

    const existingRequest = await SwapRequest.findOne({
      item: itemId,
      offeredItem: offeredItemId,
      requester: req.user.userId,
      status: "Pending",
    });

    if (existingRequest) {
      return res.status(409).json({
        message: "You already have a pending request for this swap.",
      });
    }

    const swapRequest = await SwapRequest.create({
      item: itemId,
      requester: req.user.userId,
      owner: requestedItem.owner,
      offeredItem: offeredItemId,
      message: message || "",
    });

    const populatedRequest = await SwapRequest.findById(
      swapRequest._id
    )
      .populate("item")
      .populate("offeredItem")
      .populate("requester", "name email location")
      .populate("owner", "name email location");

    res.status(201).json({
      message: "Swap request sent successfully!",
      swapRequest: populatedRequest,
    });
  } catch (error) {
    console.error("Create swap request error:", error.message);

    res.status(500).json({
      message: "Server error while creating swap request.",
    });
  }
});

// Get sent swap requests
router.get("/sent", authMiddleware, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      requester: req.user.userId,
    })
      .populate("item")
      .populate("offeredItem")
      .populate("owner", "name email location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      requests,
    });
  } catch (error) {
    console.error("Get sent requests error:", error.message);

    res.status(500).json({
      message: "Server error while fetching sent requests.",
    });
  }
});

// Get incoming swap requests
router.get("/incoming", authMiddleware, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      owner: req.user.userId,
    })
      .populate("item")
      .populate("offeredItem")
      .populate("requester", "name email location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      requests,
    });
  } catch (error) {
    console.error(
      "Get incoming requests error:",
      error.message
    );

    res.status(500).json({
      message: "Server error while fetching incoming requests.",
    });
  }
});

// Update swap request status
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Accepted",
      "Rejected",
      "Completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid swap request status.",
      });
    }

    const swapRequest = await SwapRequest.findById(
      req.params.id
    );

    if (!swapRequest) {
      return res.status(404).json({
        message: "Swap request not found.",
      });
    }

    if (
      swapRequest.owner.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Only the item owner can update this request.",
      });
    }

    // If the swap is being accepted,
    // mark both clothing items as unavailable.
    if (status === "Accepted") {
      const requestedItem = await ClothingItem.findById(
        swapRequest.item
      );

      const offeredItem = await ClothingItem.findById(
        swapRequest.offeredItem
      );

      if (!requestedItem || !offeredItem) {
        return res.status(404).json({
          message: "One or both clothing items were not found.",
        });
      }

      if (
        !requestedItem.available ||
        !offeredItem.available
      ) {
        return res.status(400).json({
          message:
            "One or both clothing items are no longer available.",
        });
      }

      requestedItem.available = false;
      offeredItem.available = false;

      await requestedItem.save();
      await offeredItem.save();
    }

    swapRequest.status = status;

    await swapRequest.save();

    const updatedRequest = await SwapRequest.findById(
      swapRequest._id
    )
      .populate("item")
      .populate("offeredItem")
      .populate("requester", "name email location")
      .populate("owner", "name email location");

    res.status(200).json({
      message: `Swap request ${status.toLowerCase()} successfully!`,
      swapRequest: updatedRequest,
    });
  } catch (error) {
    console.error(
      "Update swap request error:",
      error.message
    );

    res.status(500).json({
      message: "Server error while updating swap request.",
    });
  }
});

module.exports = router;