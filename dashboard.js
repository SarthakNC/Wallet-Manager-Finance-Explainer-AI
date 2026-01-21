// ===== Dashboard JavaScript =====

// Subcategory mappings for each category
const subcategories = {
    food: ['Groceries', 'Restaurants', 'Food Delivery', 'Cafes', 'Street Food', 'Snacks'],
    transportation: ['Fuel', 'Cab / Taxi', 'Auto / Rickshaw', 'Bus', 'Train', 'Metro', 'Parking'],
    shopping: ['Clothing', 'Electronics', 'Home Items', 'Online Shopping', 'Gifts', 'Accessories'],
    bills: ['Electricity', 'Water', 'Gas', 'Mobile Recharge', 'Internet', 'Rent'],
    entertainment: ['Movies', 'OTT Subscriptions', 'Games', 'Events', 'Partying', 'Music'],
    health: ['Doctor', 'Medicines', 'Gym', 'Hospital', 'Health Checkups', 'Supplements'],
    education: ['Course Fees', 'Books', 'Online Courses', 'Coaching', 'Stationery', 'Certifications'],
    travel: ['Hotels', 'Flights', 'Local Travel', 'Food While Traveling', 'Tour Packages'],
    subscriptions: ['Netflix', 'Spotify', 'Amazon Prime', 'YouTube Premium', 'Software', 'Cloud Storage'],
    other: ['Emergency', 'One-time Payments', 'Miscellaneous', 'Adjustments']
};

// ===== API Configuration =====
// Production API URL (Render.com)
const API_BASE_URL = 'https://wallet-manager-finance-explainer-ai-n38r.onrender.com/api';

function getAuthToken() {
    return localStorage.getItem('token');
}

async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
}

function getCurrentMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

// Financial data tracking
let financialData = {
    income: 0,
    totalSpent: 0,
    expenses: [],
    categoryTotals: {}
};

// Selected month state (defaults to current month)
let selectedMonth = getCurrentMonth();

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function () {
    initializeMonthSelector();
    loadFinancialData();
    initializeCharts();
    initializeModal();
    initializeIncomeModal();
    initializeEditExpenseModal();
    initializeDownloadReport();
    initializeSubcategories();
    initializeUserMenu();
    initializeSearch();
    setCurrentDate();
    setCurrentMonth();
    loadUserInfo();
    updateKPIs();
});

// ===== Month Selector =====
function initializeMonthSelector() {
    const monthSelect = document.getElementById('monthSelect');
    if (!monthSelect) return;

    // Generate last 12 months
    const months = generateMonthOptions(12);

    months.forEach(monthOption => {
        const option = document.createElement('option');
        option.value = monthOption.value;
        option.textContent = monthOption.label;
        if (monthOption.value === selectedMonth) {
            option.selected = true;
        }
        monthSelect.appendChild(option);
    });

    // Update month name display
    updateSelectedMonthName();

    // Add change event listener
    monthSelect.addEventListener('change', handleMonthChange);
}

function generateMonthOptions(count) {
    const months = [];
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const today = new Date();

    for (let i = 0; i < count; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthStr = String(month).padStart(2, '0');

        months.push({
            value: `${year}-${monthStr}`,
            label: `${monthNames[month - 1]} ${year}`
        });
    }

    return months;
}

function handleMonthChange(e) {
    selectedMonth = e.target.value;
    updateSelectedMonthName();
    loadFinancialData();
}

function updateSelectedMonthName() {
    const monthNameEl = document.getElementById('selectedMonthName');
    if (!monthNameEl) return;

    const [year, month] = selectedMonth.split('-');
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    monthNameEl.textContent = `${monthNames[parseInt(month) - 1]} ${year}`;
}

function getSelectedMonth() {
    return selectedMonth;
}

// ===== Chart Initialization =====
function initializeCharts() {
    // Chart.js default configuration
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#64748b';

    initializePieChart();
    initializeLineChart();
    initializeBarChart();
}

// Category Distribution Pie Chart - Empty State
function initializePieChart() {
    const ctx = document.getElementById('categoryPieChart');
    if (!ctx) return;

    // Empty data - shows "No data" message
    const data = {
        labels: ['No data yet'],
        datasets: [{
            data: [1],
            backgroundColor: ['#e2e8f0'],
            borderWidth: 0,
            hoverOffset: 0
        }]
    };

    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: '#94a3b8'
                    }
                },
                tooltip: {
                    enabled: false
                }
            }
        }
    });
}

// Daily Spending Line Chart - Empty State
function initializeLineChart() {
    const ctx = document.getElementById('monthlyLineChart');
    if (!ctx) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

    // Generate day labels for current month
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dayLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

    // Empty data
    const data = {
        labels: dayLabels,
        datasets: [{
            label: 'Daily Spending',
            data: Array(daysInMonth).fill(0),
            fill: true,
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            borderColor: '#14b8a6',
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: '#14b8a6',
            pointBorderColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 6
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        title: (items) => `Day ${items[0].label}`,
                        label: (item) => `₹${item.raw.toLocaleString('en-IN')}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        callback: (value) => `₹${value.toLocaleString('en-IN')}`,
                        color: '#94a3b8',
                        font: { size: 10 }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 10 },
                        maxRotation: 0,
                        callback: function (val, index) {
                            // Show only every 5th day label to avoid crowding
                            return (index + 1) % 5 === 0 || index === 0 ? this.getLabelForValue(val) : '';
                        }
                    }
                }
            }
        }
    });
}

// Top Expenses Bar Chart - Empty State
function initializeBarChart() {
    const ctx = document.getElementById('categoryBarChart');
    if (!ctx) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

    // Empty data for top 5 expenses
    const data = {
        labels: ['No expenses yet', '', '', '', ''],
        datasets: [{
            label: 'Amount',
            data: [0, 0, 0, 0, 0],
            backgroundColor: [
                '#14b8a6', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4'
            ],
            borderRadius: 6,
            barThickness: 24
        }]
    };

    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            indexAxis: 'y', // Horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (item) => `₹${item.raw.toLocaleString('en-IN')}`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        callback: (value) => `₹${value.toLocaleString('en-IN')}`,
                        color: '#94a3b8',
                        font: { size: 10 }
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// ===== Modal Functionality =====
function initializeModal() {
    const modal = document.getElementById('addExpenseModal');
    const addBtn = document.getElementById('addExpenseBtn');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelExpense');
    const overlay = modal?.querySelector('.modal-overlay');
    const form = document.getElementById('expenseForm');

    if (addBtn) {
        addBtn.addEventListener('click', () => openModal(modal));
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal));
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModal(modal));
    }

    if (overlay) {
        overlay.addEventListener('click', () => closeModal(modal));
    }

    if (form) {
        form.addEventListener('submit', handleExpenseSubmit);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('show')) {
            closeModal(modal);
        }
    });
}

function openModal(modal) {
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

async function handleExpenseSubmit(e) {
    e.preventDefault();

    const date = document.getElementById('expenseDate').value;
    const amount = document.getElementById('expenseAmount').value;
    const category = document.getElementById('expenseCategory').value;
    const subcategory = document.getElementById('expenseSubcategory').value;
    const note = document.getElementById('expenseNote').value;

    // Validate expense doesn't exceed income
    if (!canAddExpense(amount)) {
        return;
    }

    try {
        // Add expense to tracking via API
        const expenseData = { date, amount, category, subcategory, note, source: 'manual' };
        await addExpense(expenseData);

        // Show success notification
        showNotification('Expense added successfully!', 'success');

        // Close modal and reset form
        const modal = document.getElementById('addExpenseModal');
        closeModal(modal);
        e.target.reset();

        // Hide subcategory group
        document.getElementById('subcategoryGroup').style.display = 'none';
    } catch (error) {
        // Error is already shown by addExpense
        console.error('Failed to add expense:', error);
    }
}

// ===== User Menu =====
function initializeUserMenu() {
    const userBtn = document.getElementById('userMenuBtn');
    const dropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    if (userBtn && dropdown) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

function handleLogout() {
    // Clear auth token
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Redirect to login
    window.location.href = 'login.html';
}

// ===== Search Functionality =====
function initializeSearch() {
    const searchInput = document.getElementById('expenseSearch');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#expenseTableBody tr:not(.empty-row)');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

// ===== Utility Functions =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function setCurrentDate() {
    const dateInput = document.getElementById('expenseDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

function setCurrentMonth() {
    const monthInput = document.getElementById('incomeMonth');
    if (monthInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        monthInput.value = `${year}-${month}`;
    }
}

// ===== Subcategory Handling =====
function initializeSubcategories() {
    const categorySelect = document.getElementById('expenseCategory');
    const subcategoryGroup = document.getElementById('subcategoryGroup');
    const subcategorySelect = document.getElementById('expenseSubcategory');

    if (categorySelect) {
        categorySelect.addEventListener('change', function () {
            const category = this.value;

            if (category && subcategories[category]) {
                // Populate subcategory options
                subcategorySelect.innerHTML = '<option value="">Select subcategory</option>';
                subcategories[category].forEach(sub => {
                    const option = document.createElement('option');
                    option.value = sub.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    option.textContent = sub;
                    subcategorySelect.appendChild(option);
                });

                // Show subcategory group
                subcategoryGroup.style.display = 'block';
            } else {
                // Hide subcategory group
                subcategoryGroup.style.display = 'none';
                subcategorySelect.innerHTML = '<option value="">Select subcategory</option>';
            }
        });
    }
}

// ===== Income Modal =====
function initializeIncomeModal() {
    const modal = document.getElementById('addIncomeModal');
    const addBtn = document.getElementById('addIncomeBtn');
    const closeBtn = document.getElementById('closeIncomeModal');
    const cancelBtn = document.getElementById('cancelIncome');
    const overlay = modal?.querySelector('.modal-overlay');
    const form = document.getElementById('incomeForm');

    if (addBtn) {
        addBtn.addEventListener('click', () => openModal(modal));
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal));
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModal(modal));
    }

    if (overlay) {
        overlay.addEventListener('click', () => closeModal(modal));
    }

    if (form) {
        form.addEventListener('submit', handleIncomeSubmit);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('show')) {
            closeModal(modal);
        }
    });
}

async function handleIncomeSubmit(e) {
    e.preventDefault();

    const month = document.getElementById('incomeMonth').value;
    const amount = document.getElementById('incomeAmount').value;
    const note = document.getElementById('incomeNote').value;

    try {
        // Set income via API with the selected month
        const response = await setIncome(amount, month, note);

        // Show success notification with API message
        showNotification(response.message || 'Income saved successfully!', 'success');

        // Close modal and reset form
        const modal = document.getElementById('addIncomeModal');
        closeModal(modal);
        e.target.reset();
        setCurrentMonth();
    } catch (error) {
        // Error is already shown by setIncome
        console.error('Failed to save income:', error);
    }
}

// ===== Edit Expense Modal =====
function initializeEditExpenseModal() {
    const modal = document.getElementById('editExpenseModal');
    const closeBtn = document.getElementById('closeEditModal');
    const cancelBtn = document.getElementById('cancelEditExpense');
    const overlay = modal?.querySelector('.modal-overlay');
    const form = document.getElementById('editExpenseForm');
    const categorySelect = document.getElementById('editExpenseCategory');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal));
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModal(modal));
    }

    if (overlay) {
        overlay.addEventListener('click', () => closeModal(modal));
    }

    if (form) {
        form.addEventListener('submit', handleEditExpenseSubmit);
    }

    // Handle subcategory updates when category changes
    if (categorySelect) {
        categorySelect.addEventListener('change', function () {
            const category = this.value;
            const subcategoryGroup = document.getElementById('editSubcategoryGroup');
            const subcategorySelect = document.getElementById('editExpenseSubcategory');

            if (category && subcategories[category]) {
                subcategorySelect.innerHTML = '<option value="">Select subcategory</option>';
                subcategories[category].forEach(sub => {
                    const option = document.createElement('option');
                    option.value = sub.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    option.textContent = sub;
                    subcategorySelect.appendChild(option);
                });
                subcategoryGroup.style.display = 'block';
            } else {
                subcategoryGroup.style.display = 'none';
                subcategorySelect.innerHTML = '<option value="">Select subcategory</option>';
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('show')) {
            closeModal(modal);
        }
    });
}

function openEditExpenseModal(expense) {
    const modal = document.getElementById('editExpenseModal');
    if (!modal) return;

    // Pre-fill the form with expense data
    document.getElementById('editExpenseId').value = expense._id;
    document.getElementById('editExpenseDate').value = expense.date.split('T')[0];
    document.getElementById('editExpenseAmount').value = expense.amount;
    document.getElementById('editExpenseCategory').value = expense.mainCategory;
    document.getElementById('editExpenseNote').value = expense.note || '';

    // Handle subcategory
    const category = expense.mainCategory;
    const subcategoryGroup = document.getElementById('editSubcategoryGroup');
    const subcategorySelect = document.getElementById('editExpenseSubcategory');

    if (category && subcategories[category]) {
        subcategorySelect.innerHTML = '<option value="">Select subcategory</option>';
        subcategories[category].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.toLowerCase().replace(/[^a-z0-9]/g, '_');
            option.textContent = sub;
            subcategorySelect.appendChild(option);
        });
        subcategoryGroup.style.display = 'block';

        // Set the subcategory value if it exists
        if (expense.subCategory) {
            subcategorySelect.value = expense.subCategory;
        }
    } else {
        subcategoryGroup.style.display = 'none';
    }

    openModal(modal);
}

async function handleEditExpenseSubmit(e) {
    e.preventDefault();

    const expenseId = document.getElementById('editExpenseId').value;
    const date = document.getElementById('editExpenseDate').value;
    const amount = document.getElementById('editExpenseAmount').value;
    const category = document.getElementById('editExpenseCategory').value;
    const subcategory = document.getElementById('editExpenseSubcategory').value;
    const note = document.getElementById('editExpenseNote').value;

    try {
        await updateExpense(expenseId, {
            date,
            amount: parseFloat(amount),
            mainCategory: category,
            subCategory: subcategory || '',
            note: note || ''
        });

        showNotification('Expense updated successfully!', 'success');

        // Close modal
        const modal = document.getElementById('editExpenseModal');
        closeModal(modal);
    } catch (error) {
        console.error('Failed to update expense:', error);
    }
}

async function updateExpense(expenseId, data) {
    try {
        await apiRequest(`/expenses/${expenseId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        // Reload data to get updated totals
        await loadFinancialData();
    } catch (error) {
        showNotification('Failed to update expense: ' + error.message, 'error');
        throw error;
    }
}

function loadUserInfo() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.name) {
            const greetingEl = document.querySelector('.user-greeting');
            const userNameEl = document.querySelector('.user-name');

            if (greetingEl) greetingEl.textContent = user.name.split(' ')[0];
            if (userNameEl) userNameEl.textContent = user.name;
        }
    } catch (e) {
        console.log('No user info found');
    }
}

// ===== PDF Report Generation =====
function initializeDownloadReport() {
    const downloadBtn = document.getElementById('downloadReportBtn');
    const downloadBtn2 = document.getElementById('downloadReportBtn2');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', generatePDFReport);
    }
    if (downloadBtn2) {
        downloadBtn2.addEventListener('click', generatePDFReport);
    }
}

async function generatePDFReport() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        showNotification('PDF library not loaded', 'error');
        return;
    }

    try {
        showNotification('Generating report with charts...', 'success');

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Title
        doc.setFontSize(22);
        doc.setTextColor(20, 184, 166); // Primary Color
        doc.text('ExpenseAI Monthly Report', 14, 20);

        // Month info
        const monthName = document.getElementById('selectedMonthName').textContent;
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Period: ${monthName}`, 14, 30);

        // Report Date
        const today = new Date().toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        doc.setFontSize(10);
        doc.text(`Generated on: ${today}`, 14, 36);

        // Financial Summary Section
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.rect(14, 45, pageWidth - 28, 35, 'F');

        const income = financialData.income || 0;
        const spent = financialData.totalSpent || 0;
        const balance = income - spent;

        // Headers
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Total Income', 20, 55);
        doc.text('Total Spent', 80, 55);
        doc.text('Remaining Balance', 140, 55);

        // Values
        doc.setFontSize(14);
        doc.setTextColor(34, 197, 94); // Green
        doc.text(`Rs. ${income.toLocaleString('en-IN')}`, 20, 65);

        doc.setTextColor(239, 68, 68); // Red
        doc.text(`Rs. ${spent.toLocaleString('en-IN')}`, 80, 65);

        doc.setTextColor(balance >= 0 ? 34 : 239, balance >= 0 ? 197 : 68, balance >= 0 ? 94 : 68);
        doc.text(`Rs. ${Math.abs(balance).toLocaleString('en-IN')}`, 140, 65);

        // Spending by Category Table
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text('Spending by Category', 14, 95);

        const categoryData = Object.entries(financialData.categoryTotals || {})
            .map(([cat, amount]) => [
                cat.charAt(0).toUpperCase() + cat.slice(1),
                `Rs. ${amount.toLocaleString('en-IN')}`
            ]);

        if (categoryData.length > 0) {
            doc.autoTable({
                startY: 100,
                head: [['Category', 'Amount']],
                body: categoryData,
                theme: 'striped',
                headStyles: { fillColor: [20, 184, 166] },
                margin: { left: 14, right: 14 }
            });
        } else {
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text('No spending data for this month.', 14, 105);
        }

        // ===== Charts Section =====
        let chartY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 140;

        // Add Charts Header
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text('Visual Analytics', 14, chartY);
        chartY += 10;

        // Capture and add Pie Chart
        const pieChartCanvas = document.getElementById('categoryPieChart');
        if (pieChartCanvas) {
            const pieChart = Chart.getChart(pieChartCanvas);
            if (pieChart) {
                const pieImage = pieChart.toBase64Image('image/png', 1);
                const chartWidth = 85;
                const chartHeight = 60;

                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text('Category Distribution', 14, chartY);
                doc.addImage(pieImage, 'PNG', 14, chartY + 2, chartWidth, chartHeight);
            }
        }

        // Capture and add Line Chart (Daily Spending)
        const lineChartCanvas = document.getElementById('monthlyLineChart');
        if (lineChartCanvas) {
            const lineChart = Chart.getChart(lineChartCanvas);
            if (lineChart) {
                const lineImage = lineChart.toBase64Image('image/png', 1);
                const chartWidth = 85;
                const chartHeight = 60;

                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text('Daily Spending', 105, chartY);
                doc.addImage(lineImage, 'PNG', 105, chartY + 2, chartWidth, chartHeight);
            }
        }

        chartY += 75;

        // Check if we need a new page for the bar chart
        if (chartY + 70 > pageHeight - 30) {
            doc.addPage();
            chartY = 20;
        }

        // Capture and add Bar Chart (Top Expenses)
        const barChartCanvas = document.getElementById('categoryBarChart');
        if (barChartCanvas) {
            const barChart = Chart.getChart(barChartCanvas);
            if (barChart) {
                const barImage = barChart.toBase64Image('image/png', 1);
                const chartWidth = pageWidth - 28;
                const chartHeight = 55;

                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text('Top Expenses', 14, chartY);
                doc.addImage(barImage, 'PNG', 14, chartY + 2, chartWidth, chartHeight);
                chartY += 65;
            }
        }

        // Check if we need a new page for transaction history
        if (chartY + 40 > pageHeight - 30) {
            doc.addPage();
            chartY = 20;
        }

        // Detailed Expenses List
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text('Detailed Transaction History', 14, chartY);

        const expenses = (financialData.expenses || []).map(exp => [
            new Date(exp.date).toLocaleDateString('en-IN'),
            exp.mainCategory.charAt(0).toUpperCase() + exp.mainCategory.slice(1),
            exp.note || '-',
            `Rs. ${exp.amount.toLocaleString('en-IN')}`
        ]);

        if (expenses.length > 0) {
            doc.autoTable({
                startY: chartY + 5,
                head: [['Date', 'Category', 'Note', 'Amount']],
                body: expenses,
                theme: 'grid',
                headStyles: { fillColor: [51, 65, 85] },
                styles: { fontSize: 9 },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 'auto' },
                    3: { cellWidth: 35, halign: 'right' }
                }
            });
        } else {
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text('No transactions recorded.', 14, chartY + 10);
        }

        // Footer on all pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text('Generated by ExpenseAI Finance Manager', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        }

        // Save PDF
        const fileName = `ExpenseAI_Report_${selectedMonth}.pdf`;
        doc.save(fileName);

        showNotification('Report with charts downloaded!', 'success');

    } catch (error) {
        console.error('PDF Generation Error:', error);
        showNotification('Failed to generate PDF report', 'error');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);

    // Close on click
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        padding: 1rem 1.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 2000;
        transform: translateX(120%);
        transition: transform 0.3s ease;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        border-left: 4px solid var(--success);
    }
    
    .notification.error {
        border-left: 4px solid var(--error);
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: auto;
    }
`;
document.head.appendChild(notificationStyles);

// ===== Upload Buttons =====
document.getElementById('uploadCsvBtn')?.addEventListener('click', () => {
    showNotification('CSV upload feature coming soon!', 'success');
});

document.getElementById('uploadPdfBtn')?.addEventListener('click', () => {
    showNotification('PDF upload feature coming soon!', 'success');
});

document.getElementById('downloadReportBtn')?.addEventListener('click', () => {
    showNotification('Report download feature coming soon!', 'success');
});

// ===== Financial Data Management =====
async function loadFinancialData() {
    try {
        const token = getAuthToken();
        if (!token) {
            console.log('No auth token, skipping data load');
            return;
        }

        const monthToLoad = getSelectedMonth();

        // Fetch expenses for selected month
        const expenseData = await apiRequest(`/expenses?month=${monthToLoad}`);

        // Fetch income for selected month
        const incomeData = await apiRequest(`/income?month=${monthToLoad}`);

        financialData = {
            income: incomeData.amount || 0,
            totalSpent: expenseData.totalSpent || 0,
            expenses: expenseData.expenses || [],
            categoryTotals: expenseData.categoryTotals || {}
        };

        updateKPIs();
        updateCharts();
        renderExpenseTable();
    } catch (e) {
        console.log('Error loading financial data:', e.message);
        // Fallback to empty state
        financialData = {
            income: 0,
            totalSpent: 0,
            expenses: [],
            categoryTotals: {}
        };
        renderExpenseTable();
    }
}

// ===== Expense Table Rendering =====
function renderExpenseTable() {
    const tbody = document.getElementById('expenseTableBody');
    const showingInfo = document.getElementById('showingInfo');
    if (!tbody) return;

    const expenses = financialData.expenses || [];

    if (expenses.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="6">
                    <div class="table-empty-state">
                        <img src="assets/icon-document.png" alt="" class="empty-icon">
                        <p>No expenses for this month. Click "Add Expense" to get started!</p>
                    </div>
                </td>
            </tr>
        `;
        if (showingInfo) showingInfo.textContent = 'No expenses yet';
        return;
    }

    tbody.innerHTML = expenses.map(expense => {
        const date = new Date(expense.date);
        const formattedDate = date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        const categoryLabel = expense.mainCategory.charAt(0).toUpperCase() + expense.mainCategory.slice(1);
        const sourceLabel = expense.source ? expense.source.toUpperCase() : 'MANUAL';

        return `
            <tr data-id="${expense._id}">
                <td>${formattedDate}</td>
                <td class="amount">₹${expense.amount.toLocaleString('en-IN')}</td>
                <td>
                    <span class="category-badge ${expense.mainCategory}">${categoryLabel}</span>
                </td>
                <td>${expense.note || '-'}</td>
                <td>
                    <span class="source-badge ${expense.source || 'manual'}">${sourceLabel}</span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn edit" onclick="handleEditExpense('${expense._id}')" title="Edit">
                            <img src="assets/icon-document.png" alt="Edit">
                        </button>
                        <button class="action-btn delete" onclick="handleDeleteExpense('${expense._id}')" title="Delete">
                            <img src="assets/icon-trending-down.png" alt="Delete">
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    if (showingInfo) {
        showingInfo.textContent = `Showing ${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`;
    }
}

// Store expenses for quick lookup when editing
function getExpenseById(expenseId) {
    return financialData.expenses.find(exp => exp._id === expenseId);
}

// Handle edit expense
function handleEditExpense(expenseId) {
    const expense = getExpenseById(expenseId);
    if (!expense) {
        showNotification('Expense not found', 'error');
        return;
    }

    // Open edit modal with expense data
    openEditExpenseModal(expense);
}

async function handleDeleteExpense(expenseId) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    await deleteExpense(expenseId);
}

function updateCharts() {
    // Update pie chart with category data
    updatePieChart();
    // Update line chart with daily spending
    updateLineChart();
    // Update bar chart with top expenses
    updateBarChart();
}

function updatePieChart() {
    const ctx = document.getElementById('categoryPieChart');
    if (!ctx) return;

    const chart = Chart.getChart(ctx);
    if (!chart) return;

    const categoryTotals = financialData.categoryTotals || {};
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (labels.length === 0) {
        // No data state
        chart.data.labels = ['No data yet'];
        chart.data.datasets[0].data = [1];
        chart.data.datasets[0].backgroundColor = ['#e2e8f0'];
    } else {
        const colors = [
            '#14b8a6', '#f97316', '#8b5cf6', '#ec4899',
            '#06b6d4', '#84cc16', '#f59e0b', '#6366f1',
            '#22c55e', '#ef4444'
        ];
        chart.data.labels = labels.map(l => l.charAt(0).toUpperCase() + l.slice(1));
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].backgroundColor = colors.slice(0, labels.length);
    }

    chart.update();
}

function updateLineChart() {
    const ctx = document.getElementById('monthlyLineChart');
    if (!ctx) return;

    const chart = Chart.getChart(ctx);
    if (!chart) return;

    const expenses = financialData.expenses || [];

    // Get days in selected month
    const [year, month] = selectedMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

    // Calculate daily spending totals
    const dailyTotals = Array(daysInMonth).fill(0);

    expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const dayOfMonth = expenseDate.getDate();
        if (dayOfMonth >= 1 && dayOfMonth <= daysInMonth) {
            dailyTotals[dayOfMonth - 1] += expense.amount;
        }
    });

    // Update chart labels for selected month
    const dayLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

    chart.data.labels = dayLabels;
    chart.data.datasets[0].data = dailyTotals;

    // Update styling based on data
    const hasData = dailyTotals.some(d => d > 0);
    chart.data.datasets[0].borderColor = hasData ? '#14b8a6' : '#e2e8f0';
    chart.data.datasets[0].backgroundColor = hasData ? 'rgba(20, 184, 166, 0.1)' : 'rgba(20, 184, 166, 0.05)';

    chart.update();
}

function updateBarChart() {
    const ctx = document.getElementById('categoryBarChart');
    if (!ctx) return;

    const chart = Chart.getChart(ctx);
    if (!chart) return;

    const expenses = financialData.expenses || [];

    if (expenses.length === 0) {
        // Empty state
        chart.data.labels = ['No expenses yet', '', '', '', ''];
        chart.data.datasets[0].data = [0, 0, 0, 0, 0];
        chart.update();
        return;
    }

    // Sort expenses by amount and take top 5
    const sortedExpenses = [...expenses]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    // Create labels with category and note
    const labels = sortedExpenses.map(exp => {
        const category = exp.mainCategory.charAt(0).toUpperCase() + exp.mainCategory.slice(1);
        const note = exp.note ? ` - ${exp.note}` : '';
        const label = `${category}${note}`;
        // Truncate if too long
        return label.length > 25 ? label.substring(0, 22) + '...' : label;
    });

    const data = sortedExpenses.map(exp => exp.amount);
    const colors = ['#14b8a6', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4'];

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = colors.slice(0, data.length);

    chart.update();
}

function updateKPIs() {
    const income = financialData.income || 0;
    const spent = financialData.totalSpent || 0;
    const balance = income - spent;

    // Update Income card
    const incomeEl = document.getElementById('kpiIncome');
    const incomeSubEl = document.getElementById('kpiIncomeSub');
    const editIncomeBtn = document.getElementById('editIncomeBtn');

    if (incomeEl) {
        incomeEl.textContent = `₹${income.toLocaleString('en-IN')}`;
        if (income > 0) {
            incomeSubEl.textContent = 'Monthly budget set';
            // Show Edit Income button when income is set
            if (editIncomeBtn) {
                editIncomeBtn.style.display = 'inline-flex';
            }
        } else {
            incomeSubEl.textContent = 'Set your monthly income';
            // Hide Edit Income button when no income
            if (editIncomeBtn) {
                editIncomeBtn.style.display = 'none';
            }
        }
    }

    // Update Total Spent card
    const spentEl = document.getElementById('kpiThisMonth');
    if (spentEl) {
        spentEl.textContent = `₹${spent.toLocaleString('en-IN')}`;
    }

    // Update Remaining Balance card
    const balanceEl = document.getElementById('kpiBalance');
    const balanceSubEl = document.getElementById('kpiBalanceSub');
    const balanceCard = document.querySelector('.balance-card');

    if (balanceEl) {
        balanceEl.textContent = `₹${Math.abs(balance).toLocaleString('en-IN')}`;

        if (balance >= 0) {
            balanceCard?.classList.remove('negative');
            balanceCard?.classList.add('positive');
            balanceSubEl.textContent = balance > 0 ? 'Available to spend' : '';
        } else {
            balanceCard?.classList.remove('positive');
            balanceCard?.classList.add('negative');
            balanceSubEl.textContent = 'Over budget!';
            balanceEl.textContent = `-₹${Math.abs(balance).toLocaleString('en-IN')}`;
        }
    }

    // Update Biggest Category
    const biggestCatEl = document.getElementById('kpiBiggestCategory');
    const biggestCatSubEl = document.getElementById('kpiBiggestCategorySub');
    if (biggestCatEl) {
        const categoryTotals = financialData.categoryTotals || {};
        const categories = Object.keys(categoryTotals);

        if (categories.length > 0) {
            // Find the category with highest spending
            let maxCategory = categories[0];
            let maxAmount = categoryTotals[maxCategory];

            for (const cat of categories) {
                if (categoryTotals[cat] > maxAmount) {
                    maxAmount = categoryTotals[cat];
                    maxCategory = cat;
                }
            }

            biggestCatEl.textContent = maxCategory.charAt(0).toUpperCase() + maxCategory.slice(1);
            if (biggestCatSubEl) {
                biggestCatSubEl.textContent = `₹${maxAmount.toLocaleString('en-IN')} spent`;
            }
        } else {
            biggestCatEl.textContent = '--';
            if (biggestCatSubEl) biggestCatSubEl.textContent = '';
        }
    }

    // Update Avg Daily Spend
    const avgDailyEl = document.getElementById('kpiAvgDaily');
    if (avgDailyEl) {
        if (financialData.expenses.length > 0) {
            // Calculate days in the selected month
            const [year, month] = selectedMonth.split('-');
            const today = new Date();
            const selectedYear = parseInt(year);
            const selectedMonthNum = parseInt(month);

            let daysToCount;
            if (selectedYear === today.getFullYear() && selectedMonthNum === today.getMonth() + 1) {
                // Current month: use days elapsed
                daysToCount = today.getDate();
            } else {
                // Past month: use total days in that month
                daysToCount = new Date(selectedYear, selectedMonthNum, 0).getDate();
            }

            const avgDaily = Math.round(spent / daysToCount);
            avgDailyEl.textContent = `₹${avgDaily.toLocaleString('en-IN')}`;
        } else {
            avgDailyEl.textContent = '₹0';
        }
    }
}

function canAddExpense(amount) {
    const income = financialData.income || 0;
    const newTotal = financialData.totalSpent + parseFloat(amount);

    if (income === 0) {
        showNotification('Please set your monthly income first!', 'error');
        return false;
    }

    if (newTotal > income) {
        const remaining = income - financialData.totalSpent;
        showNotification(`Expense exceeds your budget! You have ₹${remaining.toLocaleString('en-IN')} remaining.`, 'error');
        return false;
    }

    return true;
}

async function addExpense(expenseData) {
    try {
        const response = await apiRequest('/expenses', {
            method: 'POST',
            body: JSON.stringify({
                amount: parseFloat(expenseData.amount),
                mainCategory: expenseData.category,
                subCategory: expenseData.subcategory || '',
                date: expenseData.date,
                note: expenseData.note || '',
                source: expenseData.source || 'manual'
            })
        });

        // Reload data to get updated totals
        await loadFinancialData();

        return response;
    } catch (error) {
        showNotification('Failed to add expense: ' + error.message, 'error');
        throw error;
    }
}

async function deleteExpense(expenseId) {
    try {
        await apiRequest(`/expenses/${expenseId}`, {
            method: 'DELETE'
        });

        // Reload data to get updated totals
        await loadFinancialData();

        showNotification('Expense deleted successfully!', 'success');
    } catch (error) {
        showNotification('Failed to delete expense: ' + error.message, 'error');
        throw error;
    }
}

async function setIncome(amount, month, note = '') {
    try {
        // Use provided month or fall back to selected month
        const incomeMonth = month || getSelectedMonth();

        const response = await apiRequest('/income', {
            method: 'POST',
            body: JSON.stringify({
                amount: parseFloat(amount),
                month: incomeMonth,
                note: note || ''
            })
        });

        // Reload data to get updated state
        await loadFinancialData();

        return response;
    } catch (error) {
        showNotification('Failed to save income: ' + error.message, 'error');
        throw error;
    }
}

// ===== Edit Income Modal =====
// Store current income data for editing
let currentIncomeData = null;

function initializeEditIncomeModal() {
    const modal = document.getElementById('editIncomeModal');
    const closeBtn = document.getElementById('closeEditIncomeModal');
    const cancelBtn = document.getElementById('cancelEditIncome');
    const deleteBtn = document.getElementById('deleteIncomeBtn');
    const overlay = modal?.querySelector('.modal-overlay');
    const form = document.getElementById('editIncomeForm');
    const incomeCard = document.getElementById('incomeCard');
    const editIncomeBtn = document.getElementById('editIncomeBtn');

    // Click on income card to edit
    if (incomeCard) {
        incomeCard.addEventListener('click', handleIncomeCardClick);
    }

    // Click on Edit Income button in header
    if (editIncomeBtn) {
        editIncomeBtn.addEventListener('click', handleIncomeCardClick);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal));
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModal(modal));
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteIncome);
    }

    if (overlay) {
        overlay.addEventListener('click', () => closeModal(modal));
    }

    if (form) {
        form.addEventListener('submit', handleEditIncomeSubmit);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('show')) {
            closeModal(modal);
        }
    });
}

async function handleIncomeCardClick() {
    const income = financialData.income || 0;

    if (income === 0) {
        // No income set, open add income modal instead
        const addModal = document.getElementById('addIncomeModal');
        openModal(addModal);
        return;
    }

    // Fetch the income record details from API
    try {
        const monthToLoad = getSelectedMonth();
        const response = await apiRequest(`/income?month=${monthToLoad}`);

        if (response.income) {
            currentIncomeData = response.income;
            openEditIncomeModal(currentIncomeData);
        } else {
            // No income record found, open add modal
            const addModal = document.getElementById('addIncomeModal');
            openModal(addModal);
        }
    } catch (error) {
        console.error('Failed to fetch income:', error);
        showNotification('Failed to load income data', 'error');
    }
}

function openEditIncomeModal(income) {
    const modal = document.getElementById('editIncomeModal');
    if (!modal) return;

    // Pre-fill the form with income data
    document.getElementById('editIncomeId').value = income._id;
    document.getElementById('editIncomeMonth').value = income.month;
    document.getElementById('editIncomeAmount').value = income.amount;
    document.getElementById('editIncomeNote').value = income.note || '';

    openModal(modal);
}

async function handleEditIncomeSubmit(e) {
    e.preventDefault();

    const incomeId = document.getElementById('editIncomeId').value;
    const amount = document.getElementById('editIncomeAmount').value;
    const note = document.getElementById('editIncomeNote').value;

    try {
        const response = await apiRequest(`/income/${incomeId}`, {
            method: 'PUT',
            body: JSON.stringify({
                amount: parseFloat(amount),
                note: note || ''
            })
        });

        showNotification(response.message || 'Income updated successfully!', 'success');

        // Close modal
        const modal = document.getElementById('editIncomeModal');
        closeModal(modal);

        // Reload data to get updated state
        await loadFinancialData();
    } catch (error) {
        showNotification('Failed to update income: ' + error.message, 'error');
        console.error('Failed to update income:', error);
    }
}

async function handleDeleteIncome() {
    if (!confirm('Are you sure you want to delete this income record? This action cannot be undone.')) {
        return;
    }

    const incomeId = document.getElementById('editIncomeId').value;

    try {
        await apiRequest(`/income/${incomeId}`, {
            method: 'DELETE'
        });

        showNotification('Income deleted successfully!', 'success');

        // Close modal
        const modal = document.getElementById('editIncomeModal');
        closeModal(modal);

        // Reload data to get updated state
        await loadFinancialData();
    } catch (error) {
        showNotification('Failed to delete income: ' + error.message, 'error');
        console.error('Failed to delete income:', error);
    }
}

// Initialize edit income modal on DOM load
document.addEventListener('DOMContentLoaded', function () {
    initializeEditIncomeModal();
    initializeAIInsights();
});

// ===== AI Financial Insights =====
function initializeAIInsights() {
    const refreshBtn = document.getElementById('refreshAiBtn');

    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchAIInsights);
    }
}

async function fetchAIInsights() {
    const emptyState = document.getElementById('aiEmptyState');
    const loadingState = document.getElementById('aiLoading');
    const contentState = document.getElementById('aiContent');
    const aiTime = document.getElementById('aiTime');
    const refreshBtn = document.getElementById('refreshAiBtn');

    // Check if we have expenses
    if (!financialData.expenses || financialData.expenses.length === 0) {
        showNotification('Add some expenses first to get AI insights!', 'error');
        return;
    }

    try {
        // Show loading state
        if (emptyState) emptyState.style.display = 'none';
        if (contentState) contentState.style.display = 'none';
        if (loadingState) loadingState.style.display = 'flex';
        if (refreshBtn) refreshBtn.disabled = true;

        const month = getSelectedMonth();
        const response = await apiRequest(`/ai/analyze?month=${month}`);

        if (response.success && response.insights) {
            // Format and display insights
            displayAIInsights(response.insights);

            // Update timestamp
            if (aiTime) {
                const now = new Date();
                aiTime.textContent = `Updated ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
            }
        } else {
            throw new Error('Invalid AI response');
        }

    } catch (error) {
        console.error('AI Insights Error:', error);

        // Show error in content area
        if (contentState) {
            contentState.innerHTML = `
                <div class="ai-error">
                    <p>Failed to get AI insights: ${error.message}</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem;">Please check your HF_TOKEN in the backend .env file.</p>
                </div>
            `;
            contentState.style.display = 'block';
        }

        if (aiTime) {
            aiTime.textContent = 'Analysis failed';
        }
    } finally {
        // Hide loading state
        if (loadingState) loadingState.style.display = 'none';
        if (refreshBtn) refreshBtn.disabled = false;
    }
}

function displayAIInsights(insights) {
    const contentState = document.getElementById('aiContent');
    if (!contentState) return;

    // Convert the AI response to HTML
    // The AI response may contain markdown-like formatting
    let formattedInsights = insights
        // Convert **bold** to <strong>
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Convert *italic* to <em>
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Convert numbered lists (1. item)
        .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
        // Convert bullet points (- item or • item)
        .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
        // Convert headers (## heading)
        .replace(/^##\s+(.+)$/gm, '<h4>$1</h4>')
        .replace(/^#\s+(.+)$/gm, '<h4>$1</h4>')
        // Convert newlines to <br> or <p>
        .split('\n\n').map(para => {
            para = para.trim();
            if (!para) return '';
            // If it contains list items, wrap in <ul>
            if (para.includes('<li>')) {
                return `<ul>${para}</ul>`;
            }
            // If it's already a heading, leave it
            if (para.startsWith('<h4>')) {
                return para;
            }
            return `<p>${para}</p>`;
        }).join('\n');

    // Clean up any remaining single newlines
    formattedInsights = formattedInsights.replace(/\n/g, ' ');

    contentState.innerHTML = formattedInsights;
    contentState.style.display = 'block';
}
