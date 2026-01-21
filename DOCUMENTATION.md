# ExpenseAI - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Frontend Documentation](#frontend-documentation)
4. [Backend API Documentation](#backend-api-documentation)
5. [Database Schema](#database-schema)
6. [Authentication Flow](#authentication-flow)
7. [Deployment Guide](#deployment-guide)

---

## Project Overview

**ExpenseAI** is a full-stack AI-powered finance management application that helps users track expenses, manage income, and gain insights into their spending patterns using artificial intelligence.

### Key Features
- User authentication (signup/login with JWT)
- Monthly income and expense tracking
- Interactive dashboard with Chart.js visualizations
- AI-powered spending analysis via Hugging Face API
- PDF report generation
- Responsive design for mobile and desktop

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐│
│  │index.html│  │login.html│ │signup.html│ │dashboard.html  ││
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘│
│  ┌─────────┐  ┌─────────┐  ┌──────────────────────────────┐│
│  │script.js│  │ auth.js │  │       dashboard.js           ││
│  └─────────┘  └─────────┘  └──────────────────────────────┘│
│  ┌─────────┐  ┌─────────┐  ┌──────────────────────────────┐│
│  │styles.css│ │auth.css │  │       dashboard.css          ││
│  └─────────┘  └─────────┘  └──────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                     server.js                         │  │
│  │  • Express setup, middleware, routing                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐  │
│  │authRoutes│ │expenseR.│ │incomeR. │ │  aiRoutes   │  │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Controllers & Middleware                │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                        │
│  ┌─────────┐  ┌─────────────┐  ┌───────────────────────┐  │
│  │  Users  │  │  Expenses   │  │       Incomes         │  │
│  └─────────┘  └─────────────┘  └───────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Documentation

### File Structure

| File | Purpose |
|------|---------|
| `index.html` | Landing page with features, hero section |
| `login.html` | User login page |
| `signup.html` | User registration page |
| `dashboard.html` | Main dashboard with charts and data |
| `styles.css` | Global styles and CSS variables |
| `auth.css` | Authentication pages styling |
| `dashboard.css` | Dashboard-specific styles |
| `script.js` | Landing page interactions |
| `auth.js` | Login/signup form handling |
| `dashboard.js` | Dashboard functionality and API calls |

### CSS Architecture

The project uses CSS custom properties for theming:

```css
:root {
    --primary: #14b8a6;      /* Teal */
    --secondary: #f97316;    /* Coral */
    --accent: #06b6d4;       /* Cyan */
    --success: #22c55e;      /* Green */
    --error: #ef4444;        /* Red */
}
```

**Dark mode** is supported via `[data-theme="dark"]` selector.

### JavaScript Functions

#### auth.js
| Function | Description |
|----------|-------------|
| `showNotification(message, type)` | Display toast notifications |
| `checkAuth()` | Check if user is logged in |
| `logout()` | Clear token and redirect to login |

#### dashboard.js
| Function | Description |
|----------|-------------|
| `initializeCharts()` | Set up Chart.js pie, line, bar charts |
| `loadFinancialData()` | Fetch expenses and income from API |
| `updateKPIs()` | Update KPI cards with current data |
| `addExpense(data)` | Submit new expense to API |
| `setIncome(amount, month)` | Save monthly income |
| `generatePDFReport()` | Create downloadable PDF report |
| `handleMonthChange()` | Switch between months |

---

## Backend API Documentation

### Base URL
```
Production: https://wallet-manager-finance-explainer-ai-n38r.onrender.com
Development: http://localhost:5000
```

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Expense Endpoints

All expense endpoints require `Authorization: Bearer <token>` header.

#### GET `/api/expenses?month=2026-01`
Get all expenses for a specific month.

**Response (200):**
```json
{
  "expenses": [
    {
      "_id": "expense_id",
      "date": "2026-01-15",
      "amount": 500,
      "mainCategory": "food",
      "subCategory": "restaurants",
      "note": "Dinner with friends",
      "source": "manual"
    }
  ],
  "total": 5000,
  "categoryTotals": {
    "food": 2000,
    "transportation": 1500,
    "shopping": 1500
  }
}
```

#### POST `/api/expenses`
Add a new expense.

**Request Body:**
```json
{
  "date": "2026-01-15",
  "amount": 500,
  "category": "food",
  "subcategory": "restaurants",
  "note": "Dinner",
  "source": "manual"
}
```

#### PUT `/api/expenses/:id`
Update an existing expense.

#### DELETE `/api/expenses/:id`
Delete an expense.

---

### Income Endpoints

#### GET `/api/income?month=2026-01`
Get income for a specific month.

**Response (200):**
```json
{
  "income": {
    "_id": "income_id",
    "month": "2026-01",
    "amount": 50000,
    "note": "Salary"
  }
}
```

#### POST `/api/income`
Add or update monthly income.

**Request Body:**
```json
{
  "month": "2026-01",
  "amount": 50000,
  "note": "Salary"
}
```

---

### AI Endpoints

#### POST `/api/ai/analyze`
Get AI-powered spending analysis.

**Request Body:**
```json
{
  "expenses": [...],
  "income": 50000,
  "month": "2026-01"
}
```

**Response (200):**
```json
{
  "analysis": "Based on your spending patterns...",
  "suggestions": ["Reduce food spending by 10%", "..."]
}
```

---

## Database Schema

### User Model
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hashed
  createdAt: { type: Date, default: Date.now }
}
```

### Expense Model
```javascript
{
  user: { type: ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  mainCategory: { type: String, required: true },
  subCategory: { type: String },
  note: { type: String },
  source: { type: String, default: 'manual' },
  createdAt: { type: Date, default: Date.now }
}
```

### Income Model
```javascript
{
  user: { type: ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // Format: "YYYY-MM"
  amount: { type: Number, required: true },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
}
```

---

## Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│ Login   │────▶│ Server  │────▶│ MongoDB │
│         │     │  Page   │     │validates│     │ check   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                     │               │
                     │          ┌────┴────┐
                     │          │ Generate │
                     │          │   JWT    │
                     │          └────┬────┘
                     │               │
              ┌──────▼───────┐  ┌────▼────┐
              │ Store token  │◀─│  Return │
              │ localStorage │  │  token  │
              └──────────────┘  └─────────┘
                     │
              ┌──────▼───────┐
              │   Redirect   │
              │ to Dashboard │
              └──────────────┘
```

### JWT Token Structure
- **Header:** Algorithm (HS256)
- **Payload:** User ID, email, expiration
- **Signature:** Signed with JWT_SECRET

---

## Deployment Guide

### Prerequisites
- Node.js >= 16
- MongoDB Atlas account (or local MongoDB)
- Render.com account (backend)
- Netlify account (frontend)

### Environment Variables

```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/Finance_Manager
JWT_SECRET=your_secret_key
HF_TOKEN=your_huggingface_token
```

### Backend Deployment (Render.com)
1. Connect GitHub repository
2. Set root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables

### Frontend Deployment (Netlify)
1. Connect GitHub repository
2. Publish directory: `.` (root)
3. No build command needed (static site)

---

## Categories & Subcategories

| Category | Subcategories |
|----------|---------------|
| Food & Dining | Groceries, Restaurants, Food Delivery, Cafes, Street Food, Snacks |
| Transportation | Fuel, Cab/Taxi, Auto/Rickshaw, Bus, Train, Metro, Parking |
| Shopping | Clothing, Electronics, Home Items, Online Shopping, Gifts |
| Bills & Utilities | Electricity, Water, Gas, Mobile Recharge, Internet, Rent |
| Entertainment | Movies, OTT Subscriptions, Games, Events, Partying, Music |
| Health & Fitness | Doctor, Medicines, Gym, Hospital, Health Checkups |
| Education | Course Fees, Books, Online Courses, Coaching, Stationery |
| Travel | Hotels, Flights, Local Travel, Food While Traveling |
| Subscriptions | Netflix, Spotify, Amazon Prime, YouTube Premium, Software |
| Other | Emergency, One-time Payments, Miscellaneous |

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Charts | Chart.js |
| PDF | jsPDF, jspdf-autotable |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT, bcryptjs |
| AI | Hugging Face Inference API |
| Hosting | Render.com (BE), Netlify (FE) |

---

*Documentation generated for ExpenseAI Finance Manager*
*Author: Sarthak Chumbalkar*
