const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { setIncome, getIncome, updateIncome, deleteIncome } = require("../controllers/incomeController");

// All routes are protected
router.use(authMiddleware);

router.post("/", setIncome);
router.get("/", getIncome);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

module.exports = router;
