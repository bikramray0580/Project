const express = require("express");
const router = express.Router();
const Waste = require("../models/Waste");

// GET all map markers
router.get("/", async (req, res) => {
  try {
    const waste = await Waste.findAll({
      attributes: ["id", "name", "type", "quantity", "location", "lat", "lng", "description"]
    });
    res.json(waste);
  } catch (err) {
    console.error("Map fetch error:", err);
    res.status(500).json({ error: "Server error fetching map data" });
  }
});

module.exports = router;
