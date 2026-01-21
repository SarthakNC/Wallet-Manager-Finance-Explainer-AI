const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { analyzeFinances } = require("../controllers/aiController");

// All routes are protected
router.use(authMiddleware);

// GET /api/ai/analyze?month=YYYY-MM
router.get("/analyze", analyzeFinances);

module.exports = router;
