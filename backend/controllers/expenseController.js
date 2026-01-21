const Expense = require("../models/Expense");

// Add new expense
exports.addExpense = async (req, res) => {
    try {
        const { amount, mainCategory, subCategory, date, note, source } = req.body;

        // Parse date and extract month/year
        const expenseDate = new Date(date);
        const month = expenseDate.getMonth() + 1; // 1-12
        const year = expenseDate.getFullYear();

        const expense = await Expense.create({
            userId: req.user.id,
            amount,
            mainCategory,
            subCategory: subCategory || '',
            date: expenseDate,
            month,
            year,
            note: note || '',
            source: source || 'manual'
        });

        res.status(201).json({
            message: "Expense added successfully",
            expense
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all expenses for user (with optional month filter)
exports.getExpenses = async (req, res) => {
    try {
        const { month } = req.query; // Format: YYYY-MM

        let query = { userId: req.user.id };

        // If month is provided, filter by that month using month/year fields
        if (month) {
            const [yearStr, monthStr] = month.split('-');
            query.year = parseInt(yearStr);
            query.month = parseInt(monthStr);
        }

        const expenses = await Expense.find(query).sort({ date: -1 });

        // Calculate totals
        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Group by category
        const categoryTotals = expenses.reduce((acc, exp) => {
            acc[exp.mainCategory] = (acc[exp.mainCategory] || 0) + exp.amount;
            return acc;
        }, {});

        res.json({
            expenses,
            totalSpent,
            categoryTotals,
            count: expenses.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update expense
exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, mainCategory, subCategory, date, note } = req.body;

        const expense = await Expense.findOne({ _id: id, userId: req.user.id });

        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        // Update fields
        if (amount !== undefined) expense.amount = amount;
        if (mainCategory) expense.mainCategory = mainCategory;
        if (subCategory !== undefined) expense.subCategory = subCategory;
        if (date) expense.date = new Date(date);
        if (note !== undefined) expense.note = note;

        await expense.save();

        res.json({
            message: "Expense updated successfully",
            expense
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.findOneAndDelete({ _id: id, userId: req.user.id });

        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.json({
            message: "Expense deleted successfully",
            expense
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
