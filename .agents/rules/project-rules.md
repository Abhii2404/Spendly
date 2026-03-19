---
trigger: always_on
---

# System Instructions: Spendly — Personal Finance Tracker

## Project Overview
Build a mobile-first personal finance tracker called Spendly. 
This is a portfolio showcase project. The app tracks income, 
expenses, budgets, recurring transactions, and savings goals 
with a dark premium UI.

## Tech Stack
- Frontend: Next.js 15 (App Router)
- Styling: Tailwind CSS + Lucide React icons
- Charts: Chart.js + react-chartjs-2
- Auth: Supabase Auth (email + password, JWT via HTTP-only cookies)
- Database: Supabase PostgreSQL
- Data fetching: @supabase/supabase-js ONLY
- Deployment: Vercel

## Design System

### Colors
Background:     #091428
Card surface:   #1A1A23
Primary:        #6A42E3 (purple)
Secondary:      #42E3D0 (cyan)
Income:         #42E3D0
Expense:        #F86161
Warning:        #E7BE29
Text:           #FFFFFF
Text muted:     #6B7280
Border:         rgba(255,255,255,0.08)

### Rules
- Dark mode ONLY, never white or light backgrounds
- ALL cards: glassmorphism, subtle border, border-radius 16px+
- ALL buttons: rounded-full or rounded-2xl
- ALL inputs: dark surface, white text, rounded-xl, purple focus ring
- Font: Plus Jakarta Sans (import from Google Fonts)
- Mobile-first: design for 390px width first
- Large bold numbers for all financial amounts
- Currency: ₹ (Indian Rupee) everywhere

## Pages & Routes
/login              → Login page
/signup             → Signup page
/dashboard          → Main overview (protected)
/transactions       → Full transaction history (protected)
/analytics          → Charts and reports (protected)
/settings           → Categories, export, account (protected)

## Global Layout (all protected pages)
- Floating pill-shaped bottom navigation bar (glassmorphism)
  Tabs: Dashboard | Transactions | Analytics | Settings
- Floating purple FAB (+) button above bottom nav
  Opens Add Transaction modal from any page
- Header: Spendly logo left, user avatar right

## Add Transaction Modal
- Triggers from FAB button on any page
- Slides up as bottom-sheet on mobile
- Segmented control: Income | Expense
- Fields:
  - Transaction name (text input)
  - Amount (large bold number, ₹ prefix)
  - Category (4x4 icon grid, tap to select)
  - Date picker (default today)
  - Recurring toggle switch
  - Frequency dropdown (Daily/Weekly/Monthly/Yearly)
    shown only when recurring is ON
  - Note textarea (optional)
- Save button: purple, full width, rounded-full
- On save: insert to Supabase, refresh all data

## Dashboard Page (/dashboard)
- Greeting: "Hello, [name]!" with time of day
- 3 metric cards:
  Card 1: Total Income this month (cyan)
  Card 2: Total Expense this month (red)
  Card 3: Net Balance (purple, full width)
- Budget progress section:
  - Progress bar per category
  - Cyan under 80%, yellow at 80%, red at 100%
  - "Over Budget" label when exceeded
- Recent transactions (last 5):
  - Toggle: One-Time | Recurring
  - Category icon, name, date, amount
  - "See all" link to /transactions

## Transactions Page (/transactions)
- Scrollable filter badges: All, Today, This Week, 
  This Month, This Year, Custom
- Search bar (search by name)
- Type filter: All | Income | Expense
- Category filter dropdown
- Tab: One-Time | Recurring
- Each item: icon, name, date, amount (color-coded)
- Delete with confirmation dialog

## Analytics Page (/analytics)
- 3 summary cards: Income | Expense | Net Profit
- Pie chart: category breakdown
  Toggle: Income | Expense
  Current month data
- Bar chart: Income vs Expense
  Last 6 months, purple vs red bars
- Line chart: Trend
  Toggle: Weekly | Monthly | Quarterly
  Toggle: Income | Expense

## Settings Page (/settings)
- Category management:
  - List categories with icon + type badge
  - Add category: name + icon + type
  - Delete with warning if transactions exist
- Export data:
  - Export CSV button
  - Export PDF button
- Account:
  - Show logged-in email
  - Logout button

## Supabase Database Tables

### profiles
- id (uuid, references auth.users)
- name (text)
- avatar_url (text, nullable)
- created_at (timestamp)

### categories
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- name (text)
- type (text: 'income' or 'expense')
- icon (text, Lucide icon name)
- color (text, hex)
- created_at (timestamp)

### transactions
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- name (text)
- amount (numeric)
- type (text: 'income' or 'expense')
- category_id (uuid, references categories)
- date (date)
- is_recurring (boolean, default false)
- recurring_frequency (text, nullable)
- note (text, nullable)
- created_at (timestamp)

### budgets
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- category_id (uuid, references categories)
- monthly_limit (numeric)
- month (text, format YYYY-MM)
- created_at (timestamp)

## Default Categories (seed on first login)
Expense: Food & Dining, Transport, Shopping, Health,
         Entertainment, Bills & Utilities, Travel,
         Education, Subscriptions, Other
Income:  Salary, Freelance, Investments, Rental, 
         Gifts, Other

## Security Rules
- Use @supabase/supabase-js for ALL data operations
- Never expose service role key in frontend
- All keys in environment variables only
- Enable RLS on all Supabase tables
- Users access only their own rows
- Middleware protects all /dashboard, /transactions,
  /analytics, /settings routes
- Redirect unauthenticated users to /login

## Code Quality Rules
- No console.log in final code
- TypeScript strict mode, no use of `any`
- Input validation on all forms
- Error messages for invalid inputs
- Confirmation dialogs for all delete actions
- Never add features not explicitly asked for

## Build Order (follow this sequence strictly)
1. Project scaffold + Tailwind + Supabase setup
2. Login and Signup pages
3. Middleware (route protection)
4. Global layout (bottom nav + FAB)
5. Add Transaction modal
6. Dashboard page
7. Transactions page
8. Analytics page
9. Settings page
10. Polish, animations, export feature