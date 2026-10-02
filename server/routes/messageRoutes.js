const express = require("express");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Send a message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      receiverId,
      swapRequestId,
      text,
    } = req.body;

    if (!receiverId || !text || !text.trim()) {
      return res.status(400).json({
        message: "Receiver and message are required.",
      });
    }

    if (receiverId === req.user.userId) {
      return res.status(400).json({
        message: "You cannot send a message to yourself.",
      });
    }

    const message = await Message.create({
      sender: req.user.userId,
      receiver: receiverId,
      swapRequest: swapRequestId || undefined,
      text: text.trim(),
    });

    const populatedMessage = await Message.findById(
      message._id
    )
      .populate("sender", "name email location")
      .populate("receiver", "name email location");

    res.status(201).json({
      message: "Message sent successfully!",
      chatMessage: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error.message);

    res.status(500).json({
      message: "Server error while sending message.",
    });
  }
});

// Get conversation with another user
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        {
          sender: currentUserId,
          receiver: otherUserId,
        },
        {
          sender: otherUserId,
          receiver: currentUserId,
        },
      ],
    })
      .populate("sender", "name email location")
      .populate("receiver", "name email location")
      .sort({ createdAt: 1 });

    res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error.message);

    res.status(500).json({
      message: "Server error while fetching messages.",
    });
  }
});

module.exports = router;