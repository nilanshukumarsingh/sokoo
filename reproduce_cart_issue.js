const axios = require("axios");
const mongoose = require("mongoose");
const User = require("./models/User");
const Product = require("./models/Product");
const connectDB = require("./config/db");

// Mock Env
process.env.JWT_SECRET = "this_is_a_secure_ramdom_secret_key_for_jwt";
process.env.MONGO_URI = "mongodb://localhost:27017/soko";

const run = async () => {
  try {
    await connectDB();

    // 1. Get a user or create one
    let user = await User.findOne({ email: "test@example.com" });
    if (!user) {
      user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });
      console.log("Created test user");
    }

    // 2. Login to get token (simulated by generating it manually since we have the secret)
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    console.log("Got token");

    // 3. Get a product
    const product = await Product.findOne();
    if (!product) {
      console.error("No products found to add to cart");
      process.exit(1);
    }
    console.log("Got product:", product._id);

    // 4. Add to cart via HTTP (local server must be running!)
    // Actually, let's assume the server is running on port 5000 as per metadata.

    try {
      const res = await axios.post(
        "http://localhost:5000/api/cart",
        {
          productId: product._id,
          quantity: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Add to cart success:", res.data);
    } catch (err) {
      console.error(
        "Add to cart failed:",
        err.response ? err.response.data : err.message
      );
    }
  } catch (err) {
    console.error("Script error:", err);
  } finally {
    await mongoose.connection.close(); // Close DB connection but Axios request goes to running server
  }
};

run();
