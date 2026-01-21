const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    mainCategory: {
        type: String,
        required: true,
        enum: ['food', 'transportation', 'shopping', 'bills', 'entertainment', 'health', 'education', 'travel', 'subscriptions', 'other']
    },
    subCategory: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    note: {
        type: String,
        default: ''
    },
    source: {
        type: String,
        enum: ['manual', 'csv', 'pdf'],
        default: 'manual'
    }
}, { timestamps: true });

// Index for efficient queries by user, month, and year
expenseSchema.index({ userId: 1, year: -1, month: -1 });
expenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Expense", expenseSchema);
