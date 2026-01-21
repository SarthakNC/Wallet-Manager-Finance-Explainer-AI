# 💰 ExpenseAI - AI-Powered Finance Manager
An intelligent expense tracking and financial management application powered by AI. Upload your expenses and let AI analyze your spending patterns, detect waste, and help you save smarter.

### 🏠 Landing Page
- Modern, responsive design with light/dark mode
- Animated hero section with gradient orbs
- Feature showcase and benefits
- Mobile-friendly navigation

### 📊 Dashboard
- **Real-time expense tracking** - Monitor your spending as it happens
- **Interactive charts** - Pie chart, line chart, and bar chart visualizations
- **Monthly overview** - Switch between months to compare spending
- **KPI cards** - Income, expenses, balance, and biggest category at a glance
- **Expense table** - Searchable, sortable list of all expenses

### 🤖 AI-Powered Insights
- Get personalized spending analysis from AI
- Identify spending patterns and habits
- Receive actionable saving suggestions
- Detect potential waste and overspending

### 💵 Income & Expense Management
- Add/edit monthly income
- Add/edit/delete expenses with categories and subcategories
- 10 main categories with 60+ subcategories
- Manual expense entry

### 📥 Reports
- Download PDF reports of your monthly expenses
- AI-generated financial summaries

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Flexbox, Grid, animations
- **JavaScript (ES6+)** - Vanilla JS, async/await
- **Chart.js** - Interactive data visualizations
- **jsPDF** - PDF report generation
### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Hugging Face API** - AI insights

## 📁 Project Structure

Finance Manager/
├── index.html          # Landing page
├── login.html          # Login page
├── signup.html         # Signup page
├── dashboard.html      # Main dashboard
├── styles.css          # Global styles
├── auth.css            # Authentication page styles
├── dashboard.css       # Dashboard styles
├── script.js           # Landing page scripts
├── auth.js             # Authentication logic
├── dashboard.js        # Dashboard functionality
├── assets/             # Images and icons
└── backend/
    ├── server.js       # Express server
    ├── config/
    │   └── db.js       # MongoDB connection
    ├── controllers/
    │   ├── authController.js
    │   ├── expenseController.js
    │   ├── incomeController.js
    │   └── aiController.js
    ├── middleware/
    │   └── authMiddleware.js
    ├── models/
    │   ├── User.js
    │   ├── Expense.js
    │   └── Income.js
    └── routes/
        ├── authRoutes.js
        ├── expenseRoutes.js
        ├── incomeRoutes.js
        └── aiRoutes.js
```

### Installation
1. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**
   
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/Finance_Manager
   JWT_SECRET=your_jwt_secret_key
   HF_TOKEN=your_huggingface_api_token
   ```

3. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

5. **Open the frontend**
   Open `index.html` in your browser, or use a local server:
   ```bash
   npx serve .
   ```

## 👨‍💻 Author
**Sarthak Chumbalkar**

- GitHub: [@SarthakNC](https://github.com/SarthakNC)
- LinkedIn: [Sarthak Chumbalkar](https://www.linkedin.com/in/sarthak-chumbalkar/)

