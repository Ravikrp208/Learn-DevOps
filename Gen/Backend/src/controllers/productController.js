import Product from "../models/Product.js";
import { products as seedData } from "../data/products.js";

// @desc    Get all products (with filters & sorting)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, q, maxPrice, sortBy } = req.query;
    let query = {};

    // Category Filter
    if (category && category !== "All") {
      query.category = category;
    }

    // Search Query (Name, Category or Description)
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // Price Filter
    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }

    // Initialize database query
    let productQuery = Product.find(query);

    // Sorting
    if (sortBy === "price-asc") {
      productQuery = productQuery.sort({ price: 1 });
    } else if (sortBy === "price-desc") {
      productQuery = productQuery.sort({ price: -1 });
    } else if (sortBy === "rating") {
      productQuery = productQuery.sort({ rating: -1 });
    } else {
      // Default: sort featured first, then standard
      productQuery = productQuery.sort({ isFeatured: -1, createdAt: -1 });
    }

    const products = await productQuery;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by id
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    // Search using the custom string 'id' field
    const product = await Product.findOne({ id: req.params.id });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed database with initial products
// @route   POST /api/products/seed
// @access  Public
export const seedProducts = async (req, res) => {
  try {
    // Clear existing products
    await Product.deleteMany({});

    // Seed data
    const createdProducts = await Product.insertMany(seedData);
    res.status(201).json({
      message: "Products seeded successfully",
      count: createdProducts.length,
      products: createdProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
