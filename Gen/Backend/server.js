import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import Product from "./src/models/Product.js";
import { products } from "./src/data/products.js";

dotenv.config();

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed products if database is empty
    const count = await Product.countDocuments();

    if (count === 0) {
      await Product.insertMany(products);
      console.log("Products seeded successfully!");
    }

    // Start server
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server error:", error.message);
    process.exit(1);
  }
};

startServer();
