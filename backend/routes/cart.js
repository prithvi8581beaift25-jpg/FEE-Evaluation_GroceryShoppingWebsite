// routes/cart.js
const express = require("express");
const db = require("../db");
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();

// All cart routes require login
router.use(authMiddleware);

// GET /api/cart — get user's cart with product details
router.get("/", (req, res) => {
  const items = db.prepare(`
    SELECT c.id, c.qty, p.id as product_id, p.name, p.price, p.unit, p.img, p.category
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
    ORDER BY c.id
  `).all(req.user.id);
  res.json({ cart: items });
});

// POST /api/cart — add item (or increment qty)
router.post("/", (req, res) => {
  const { product_id, qty = 1 } = req.body;
  if (!product_id) return res.status(400).json({ error: "product_id required" });

  const product = db.prepare("SELECT id, name FROM products WHERE id = ?").get(product_id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const existing = db.prepare("SELECT * FROM cart WHERE user_id = ? AND product_id = ?").get(req.user.id, product_id);

  if (existing) {
    db.prepare("UPDATE cart SET qty = qty + ? WHERE user_id = ? AND product_id = ?")
      .run(qty, req.user.id, product_id);
  } else {
    db.prepare("INSERT INTO cart (user_id, product_id, qty) VALUES (?, ?, ?)")
      .run(req.user.id, product_id, qty);
  }

  res.json({ message: product.name + " added to cart!" });
});

// PATCH /api/cart/:product_id — set exact qty
router.patch("/:product_id", (req, res) => {
  const { qty } = req.body;
  const pid = parseInt(req.params.product_id);

  if (!qty || qty < 1) {
    db.prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?").run(req.user.id, pid);
    return res.json({ message: "Item removed from cart" });
  }

  db.prepare("UPDATE cart SET qty = ? WHERE user_id = ? AND product_id = ?").run(qty, req.user.id, pid);
  res.json({ message: "Cart updated" });
});

// DELETE /api/cart/:product_id — remove one item
router.delete("/:product_id", (req, res) => {
  db.prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?").run(req.user.id, req.params.product_id);
  res.json({ message: "Item removed" });
});

// DELETE /api/cart — clear entire cart
router.delete("/", (req, res) => {
  db.prepare("DELETE FROM cart WHERE user_id = ?").run(req.user.id);
  res.json({ message: "Cart cleared" });
});

module.exports = router;
