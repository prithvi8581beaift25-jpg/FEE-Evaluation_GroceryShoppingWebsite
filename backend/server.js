// server.js — FreshMart Backend
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({ origin: "*" })); // allow all origins for local dev
app.use(express.json());
app.use(express.static(path.join(__dirname, "../"))); // serve frontend files

// ── Init DB (creates tables + seeds products) ──────────────────
require("./db");

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/cart",     require("./routes/cart"));
app.use("/api/orders",   require("./routes/orders"));

// ── Health check ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FreshMart API running 🌿", time: new Date() });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 FreshMart API running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Products: http://localhost:${PORT}/api/products\n`);
});
