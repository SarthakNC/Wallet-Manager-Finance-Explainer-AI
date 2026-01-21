const Expense = require("../models/Expense");
const Income = require("../models/Income");

// AI Analysis endpoint
exports.analyzeFinances = async (req, res) => {
    try {
        const { month } = req.query; // Format: YYYY-MM
        const userId = req.user.id;

        if (!month) {
            return res.status(400).json({ message: "Month parameter is required" });
        }

        // Fetch income for the month
        const income = await Income.findOne({ userId, month });
        const incomeAmount = income ? income.amount : 0;

        // Fetch expenses for the month
        const [year, monthNum] = month.split('-');
        const startDate = new Date(year, parseInt(monthNum) - 1, 1);
        const endDate = new Date(year, parseInt(monthNum), 0, 23, 59, 59);

        const expenses = await Expense.find({
            userId,
            date: { $gte: startDate, $lte: endDate }
        });

        // Calculate totals
        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const balance = incomeAmount - totalSpent;

        // Calculate category totals
        const categoryTotals = {};
        expenses.forEach(exp => {
            const cat = exp.mainCategory;
            categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
        });

        // Get top 5 expenses
        const topExpenses = [...expenses]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map(exp => ({
                amount: exp.amount,
                category: exp.mainCategory,
                note: exp.note || 'No description'
            }));

        // Build the prompt for AI
        const prompt = buildAIPrompt({
            month,
            income: incomeAmount,
            totalSpent,
            balance,
            categoryTotals,
            topExpenses,
            expenseCount: expenses.length
        });

        // Call Hugging Face AI API
        const aiResponse = await callAI(prompt);

        res.json({
            success: true,
            insights: aiResponse,
            data: {
                income: incomeAmount,
                totalSpent,
                balance,
                categoryTotals,
                topExpenses
            }
        });

    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({
            message: "Failed to generate AI insights",
            error: error.message
        });
    }
};

function buildAIPrompt(data) {
    const { month, income, totalSpent, balance, categoryTotals, topExpenses, expenseCount } = data;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const [year, monthNum] = month.split('-');
    const monthName = monthNames[parseInt(monthNum) - 1];

    // Format category spending
    const categoryBreakdown = Object.entries(categoryTotals)
        .map(([cat, amount]) => `- ${cat}: ₹${amount.toLocaleString('en-IN')}`)
        .join('\n') || '- No spending recorded';

    // Format top expenses
    const topExpensesList = topExpenses
        .map((exp, i) => `${i + 1}. ₹${exp.amount.toLocaleString('en-IN')} on ${exp.category} (${exp.note})`)
        .join('\n') || 'No expenses recorded';

    const spendingPercentage = income > 0 ? ((totalSpent / income) * 100).toFixed(1) : 0;

    return `You are a friendly financial advisor AI. Analyze this user's financial data for ${monthName} ${year} and provide helpful insights.

FINANCIAL DATA:
- Monthly Income: ₹${income.toLocaleString('en-IN')}
- Total Spent: ₹${totalSpent.toLocaleString('en-IN')} (${spendingPercentage}% of income)
- Remaining Balance: ₹${balance.toLocaleString('en-IN')}
- Number of Transactions: ${expenseCount}

SPENDING BY CATEGORY:
${categoryBreakdown}

TOP 5 EXPENSES:
${topExpensesList}

Please provide:
1. A brief 2-3 sentence summary of their spending
2. Any concerning patterns or warnings (if spending is high in any category)
3. 2-3 practical saving tips based on their spending patterns
4. A list of expenses that are above average
5. A list of expenses that are below average
6. A financial goal based on their spending patterns
7. A finance tip based on their spending patterns
8. An encouraging note about their finances


Keep your response concise, friendly, and actionable. Use emojis sparingly. Format with clear sections.`;
}

async function callAI(prompt) {
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
        throw new Error("HF_TOKEN not configured in environment");
    }

    try {
        const response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    model: "Qwen/Qwen3-4B-Instruct-2507",
                    max_tokens: 500,
                    temperature: 0.7
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "AI API request failed");
        }

        const result = await response.json();

        // Extract the AI's response text
        if (result.choices && result.choices[0] && result.choices[0].message) {
            return result.choices[0].message.content;
        }

        throw new Error("Unexpected AI response format");

    } catch (error) {
        console.error("AI API Error:", error);
        throw error;
    }
}
