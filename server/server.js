const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const clothingRoutes = require("./routes/clothingRoutes");
const swapRoutes = require("./routes/swapRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error.message);
  });

// Authentication routes
app.use("/api/auth", authRoutes);

// Clothing routes
app.use("/api/clothing", clothingRoutes);

// Swap request routes
app.use("/api/swaps", swapRoutes);

// Chat message routes
app.use("/api/messages", messageRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "ClothingSwap backend is running successfully!",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});