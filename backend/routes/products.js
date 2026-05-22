// routes/products.js
const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/products — all products, optional ?category=fruits&search=apple&sort=price-asc
router.get("/", (req, res) => {
  const { category, search, sort } = req.query;

  let query = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category && category !== "all") {
    query += " AND category = ?";
    params.push(category);
  }

  if (search) {
    query += " AND (LOWER(name) LIKE ? OR LOWER(desc) LIKE ?)";
    params.push("%" + search.toLowerCase() + "%");
    params.push("%" + search.toLowerCase() + "%");
  }

  const sortMap = {
    "price-asc":  "price ASC",
    "price-desc": "price DESC",
    "name-asc":   "name ASC",
    "name-desc":  "name DESC",
    "rating":     "rating DESC",
  };
  query += " ORDER BY " + (sortMap[sort] || "id ASC");

  const products = db.prepare(query).all(...params);
  res.json({ products, total: products.length });
});

// GET /api/products/categories — unique category list
router.get("/categories", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT category FROM products ORDER BY category").all();
  res.json({ categories: rows.map(r => r.category) });
});

// GET /api/products/:id — single product
router.get("/:id", (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ product });
});

module.exports = router;
