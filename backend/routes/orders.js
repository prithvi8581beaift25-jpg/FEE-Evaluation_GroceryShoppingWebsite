// routes/orders.js
const express = require("express");
const db = require("../db");
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();

router.use(authMiddleware);

// POST /api/orders — place order from current cart
router.post("/", (req, res) => {
  const { address, coupon } = req.body;
  if (!address) return res.status(400).json({ error: "Delivery address is required" });

  const cartItems = db.prepare(`
    SELECT c.qty, p.id as product_id, p.name, p.price, p.unit, p.img
    FROM cart c JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `).all(req.user.id);

  if (!cartItems.length) return res.status(400).json({ error: "Cart is empty" });

  const validCoupons = { FRESH10: 10, SAVE20: 20, MART50: 50 };
  const discountPct = coupon ? (validCoupons[coupon.toUpperCase()] || 0) : 0;

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const delivery = subtotal >= 500 ? 0 : 40;
  const discount = Math.round(subtotal * discountPct / 100);
  const total = subtotal + delivery - discount;

  const orderId = db.prepare(`
    INSERT INTO orders (user_id, items, subtotal, delivery, discount, total, address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id,
    JSON.stringify(cartItems),
    subtotal, delivery, discount, total,
    JSON.stringify(address)
  ).lastInsertRowid;

  // Clear cart after order
  db.prepare("DELETE FROM cart WHERE user_id = ?").run(req.user.id);

  res.status(201).json({
    message: "Order placed successfully!",
    order: { id: "FM" + String(orderId).padStart(6, "0"), total, subtotal, delivery, discount, items: cartItems }
  });
});

// GET /api/orders — order history
router.get("/", (req, res) => {
  const orders = db.prepare(`
    SELECT id, items, subtotal, delivery, discount, total, address, status, created_at
    FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.user.id);

  const parsed = orders.map(o => ({
    ...o,
    id: "FM" + String(o.id).padStart(6, "0"),
    items: JSON.parse(o.items),
    address: JSON.parse(o.address)
  }));

  res.json({ orders: parsed });
});

module.exports = router;
