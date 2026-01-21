const Income = require("../models/Income");

// Add income for a month (adds to existing if present)
exports.setIncome = async (req, res) => {
    try {
        const { amount, month, note } = req.body;
        const incomeAmount = parseFloat(amount);

        // Check if income already exists for this month
        const existingIncome = await Income.findOne({ userId: req.user.id, month });

        let income;
        if (existingIncome) {
            // Add to existing income
            existingIncome.amount += incomeAmount;
            if (note) {
                existingIncome.note = existingIncome.note
                    ? `${existingIncome.note}, ${note}`
                    : note;
            }
            await existingIncome.save();
            income = existingIncome;
        } else {
            // Create new income record
            income = await Income.create({
                userId: req.user.id,
                amount: incomeAmount,
                month,
                note: note || ''
            });
        }

        res.json({
            message: existingIncome
                ? `Income added! New total: ₹${income.amount.toLocaleString('en-IN')}`
                : "Income saved successfully",
            income
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get income for user
exports.getIncome = async (req, res) => {
    try {
        const { month } = req.query; // Optional: Format YYYY-MM

        let query = { userId: req.user.id };

        if (month) {
            query.month = month;
        }

        const incomes = await Income.find(query).sort({ month: -1 });

        // If specific month requested, return single income
        if (month) {
            const income = incomes[0] || null;
            return res.json({
                income,
                amount: income ? income.amount : 0
            });
        }

        res.json({
            incomes,
            count: incomes.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update income for a specific month
exports.updateIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, note } = req.body;

        const income = await Income.findOne({ _id: id, userId: req.user.id });

        if (!income) {
            return res.status(404).json({ message: "Income record not found" });
        }

        // Update fields
        if (amount !== undefined) {
            income.amount = parseFloat(amount);
        }
        if (note !== undefined) {
            income.note = note;
        }

        await income.save();

        res.json({
            message: `Income updated to ₹${income.amount.toLocaleString('en-IN')}`,
            income
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete income record
exports.deleteIncome = async (req, res) => {
    try {
        const { id } = req.params;

        const income = await Income.findOneAndDelete({ _id: id, userId: req.user.id });

        if (!income) {
            return res.status(404).json({ message: "Income record not found" });
        }

        res.json({
            message: "Income deleted successfully",
            deletedIncome: income
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
