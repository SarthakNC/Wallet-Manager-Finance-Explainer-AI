const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    month: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}$/ // Format: YYYY-MM
    },
    note: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Compound index to ensure one income record per user per month
incomeSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Income", incomeSchema);
