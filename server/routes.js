// routes.js
const express = require("express");
const router = express.Router();

// Example route
router.get("/api/data", (req, res) => {
  res.json({ message: "Data from the API" });
});

module.exports = router;
