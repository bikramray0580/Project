const express = require("express");
const router = express.Router();

const Waste = require("../models/Waste");
const Request = require("../models/Request");
const Service = require("../models/Service");

router.get("/", async (req, res) => {
  try {
    const wasteCount = await Waste.count();
    const requestCount = await Request.count();
    const serviceCount = await Service.count();

    res.json({ wasteCount, requestCount, serviceCount });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Server error fetching stats" });
  }
});

module.exports = router;
