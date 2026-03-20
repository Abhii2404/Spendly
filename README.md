<div align="center">

```text
 ███████╗██████╗ ███████╗███╗   ██╗██████╗ ██╗  ██╗   ██╗
 ██╔════╝██╔══██╗██╔════╝████╗  ██║██╔══██╗██║  ╚██╗ ██╔╝
 ███████╗██████╔╝█████╗  ██╔██╗ ██║██║  ██║██║   ╚████╔╝ 
 ╚════██║██╔═══╝ ██╔══╝  ██║╚██╗██║██║  ██║██║    ╚██╔╝  
 ███████║██║     ███████╗██║ ╚████║██████╔╝███████╗██║   
 ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝   
```

**A dark, premium personal finance tracker built with Next.js and Supabase**

[![Live Demo](https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://spendly-pied-five.vercel.app)
[![GitHub Stars](https://img.shields.io/github/stars/Abhii2404/Spendly?style=for-the-badge&logo=github)](https://github.com/Abhii2404/Spendly)

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 🌐 Live Demo

```text
🌐 Live Demo: https://spendly-pied-five.vercel.app
```
> **Note:** Screenshots coming soon. Real app screenshots will be added here showcasing the dark premium UI, dashboard, and analytics.

---

## 📖 About The Project

**Spendly** is a comprehensive, mobile-first personal finance tracker designed to provide absolute clarity over your income, expenses, and savings goals. Built as a portfolio showcase piece, it emphasizes a sleek, dark-themed aesthetic with glassmorphism elements, offering a premium "fintech" feel out of the box.

The core motivation behind Spendly was to build a full-stack Next.js application that goes beyond simple CRUD operations. It tackles real-world complexities like complex temporal data filtering, seamless recurring transactions, and dynamic budget tracking—all wrapped in a highly responsive user interface originally designed for 390px mobile viewports but fully responsive across devices.

Technically, Spendly stands out by employing a Backend-For-Frontend (BFF) pattern using Next.js 15 App Router, coupled strictly with **Supabase** via the `@supabase/supabase-js` client. This ensures immediate data synchronization. Furthermore, security is top-of-mind: authentication uses HTTP-only cookies storing JWTs, and the entire database is fortified using robust Row Level Security (RLS) policies. Spendly is also fully containerized with Docker for future NestJS microservices orchestration.

---

## ✨ Features

### 🔐 Authentication
- ✅ **Email/password auth** via Supabase
- ✅ **JWT stored tightly** in HTTP-only cookies
- ✅ **Route protection** via Next.js middleware
- ✅ **Row Level Security (RLS)** configured on all database tables

### 📊 Dashboard
- ✅ **Real-time financial overview** highlighting key metrics
- ✅ **Income, Expense, and Net Balance** highly-visible metric cards
- ✅ **Period selector** (Week / Month / Year / Custom range)
- ✅ **Budget progress tracking** with dynamic color alerts under thresholds
- ✅ **Recent transactions** segmented cleanly with One-Time / Recurring tabs

### 💸 Transaction Management
- ✅ **Add income and expense** transactions via universal floating action button (FAB)
- ✅ **Category-based organization** utilizing a customized subset of Lucide icons
- ✅ **Recurring transaction support** (Daily, Weekly, Monthly, Yearly)
- ✅ **Advanced filtering** across periods, types, categories, and direct text search
- ✅ **Custom date range filter** featuring a slide-down animation calendar

### 📈 Analytics
- ✅ **Doughnut chart**: visualizes precise spending variations by category
- ✅ **Bar chart**: contrasts Income vs. Expense dynamically over a 6-month historical sliding window
- ✅ **Line chart**: tracks spending trends incrementally (Weekly, Monthly, Quarterly)
- ✅ **Toggle seamlessly** between income and expense aggregate views directly on the charts

### ⚙️ Settings
- ✅ **Category management**: custom category creation, customized colors/icons, and deletion
- ✅ **Budget limits**: set hard limits per category tracking spending per month
- ✅ **Data export**: download transactions effortlessly as CSV files
- ✅ **Monthly report**: generate static ledger reports directly as PDF
- ✅ **Danger zone**: completely reset your financial records with confirmation dialog

### 🎨 Design
- ✅ **Dark premium UI** featuring a rich `#091428` primary background
- ✅ **Glassmorphism cards** applying deep `blur` backdrop filters and subtle contrast borders
- ✅ **Floating pill-shaped** bottom navigation structure
- ✅ **Mobile-first architecture** highly optimized for standard 390px mobile width and up
- ✅ **Plus Jakarta Sans typography** for crisp, geometric numeric readability
- ✅ **Smooth animations throughout**, ranging from button active scales to page fade-ins

### 🐳 DevOps
- ✅ **Docker support** executing a multi-stage optimized build pipeline
- ✅ **Docker Compose** pre-configured for frictionless local scaling and development
- ✅ **Production ready container** reduced to a hyper-slim footprint (~150MB) 
- ✅ **Vercel deployment** leveraging auto-deploy with standalone output configuration

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Charts** | Chart.js + react-chartjs-2 |
| **Authentication** | Supabase Auth (Email/Password) |
| **Database** | Supabase PostgreSQL |
| **ORM** | Prisma (migrations only) |
| **Deployment** | Vercel |
| **Containerization** | Docker + Docker Compose |

---

## 🏗️ Architecture

The app is decoupled across explicit boundaries leveraging the robust internal API mechanics of Next.js alongside Supabase's fully-managed backend.

```text
┌─────────────────────────────────────────┐
│           Browser (Mobile First)         │
│         React Components + Hooks         │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Next.js 15 (App Router)          │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │   Pages &   │  │   API Routes     │  │
│  │  Components │  │   (BFF Layer)    │  │
│  └─────────────┘  └──────────────────┘  │
│         │                │              │
│  ┌──────▼────────────────▼────────┐     │
│  │      Supabase JS Client        │     │
│  └──────────────────┬─────────────┘     │
└─────────────────────┼───────────────────┘
                      │
┌─────────────────────▼───────────────────┐
│            Supabase Cloud                │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │  PostgreSQL  │  │   Auth (JWT)    │  │
│  │  + RLS       │  │   HTTP-only     │  │
│  │  Policies    │  │   Cookies       │  │
│  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────┘

Future: NestJS microservices will be added
as separate Docker containers orchestrated
via docker-compose.yml
```

---

## 🚀 Getting Started

### Prerequisites

- ✅ Node.js 20+
- ✅ npm or yarn
- ✅ Supabase account (free tier works)
- ✅ Docker Desktop (optional)

### Option A — Standard Setup

1. Clone the repository
```bash
git clone https://github.com/Abhii2404/Spendly.git
cd Spendly
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Then fill in your Supabase credentials inside `.env.local`.

4. Set up Supabase database
*Please refer to [Section 8 — 🗄️ Database Setup](#-database-setup) to quickly migrate the needed tables to your instance.*

5. Run development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) inside your browser.

### Option B — Docker Setup

```bash
# Copy environment file
cp .env.example .env

# Fill in your Supabase values in .env
# Then build and run
docker-compose up --build

# Open http://localhost:3000
```

---

## 🗄️ Database Setup

To quickly configure your Supabase backend to interact with Spendly, run the SQL setup commands directly in your Supabase SQL editor:

1. Create a Supabase project at [supabase.com](https://supabase.com/).
2. Navigate to the SQL Editor.
3. Run these tables in the following exact order:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income','expense')) NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

-- Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  type TEXT CHECK (type IN ('income','expense')) NOT NULL,
  category_id UUID REFERENCES categories(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily','weekly','monthly','yearly')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets table
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  monthly_limit NUMERIC(10,2) NOT NULL,
  month TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, month)
);
```

**Row Level Security (RLS) Policies**

```sql
-- Enable RLS across all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Apply policies restricting data only to authenticated matching owners
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);
```

4. Add your newly configured Supabase URL and anon key to `.env.local`.

---

## 📁 Project Structure

```text
spendly/
├── app/
│   ├── (protected)/
│   │   ├── dashboard/      # Financial overview
│   │   ├── transactions/   # Transaction history
│   │   ├── analytics/      # Charts & insights
│   │   ├── settings/       # App configuration
│   │   └── layout.tsx      # Protected layout
│   ├── login/              # Auth pages
│   ├── signup/
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/
│   ├── layout/             # Nav, Header, FAB
│   ├── transactions/       # Modal components
│   └── ui/                 # Reusable components
├── context/                # React contexts
├── hooks/                  # Custom data hooks
├── lib/
│   └── supabase/           # DB client setup
├── Dockerfile              # Container definition
├── docker-compose.yml      # Local orchestration
└── middleware.ts           # Route protection
```

---

## 🔐 Security Features

- ✅ **Supabase Auth with JWT tokens** resolving securely server-side.
- ✅ **HTTP-only cookies** eliminating specific cross-site scripting (XSS) token extraction.
- ✅ **Row Level Security** strictly binding database actions per user UUID directly.
- ✅ **Next.js middleware route protection** ensuring silent rerouting of unauthenticated connections.
- ✅ **Environment variables** segregating all secrets successfully from public Git tracking.
- ✅ **Non-root Docker user** ensuring containers possess un-elevated operational logic permissions.
- ✅ **Input validation** on all forms checking specific date/limit discrepancies.
- ✅ **TypeScript strict mode** resulting in compile-time elimination of un-handled paths.

---

## 🗺️ Roadmap

**Completed:**
- [x] User authentication (Email + Pass)
- [x] Transaction CRUD
- [x] Budget tracking
- [x] Analytics charts
- [x] CSV/PDF export
- [x] Docker support
- [x] Vercel deployment

**Planned:**
- [ ] NestJS Transaction microservice
- [ ] NestJS Analytics microservice
- [ ] Multi-currency live conversion
- [ ] Push notifications
- [ ] Bank account sync
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are heavily encouraged and always welcome:

1. Fork the repo.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 👨‍💻 Author

**Abhii2404**
- GitHub: [@Abhii2404](https://github.com/Abhii2404)
- Project Link: [https://github.com/Abhii2404/Spendly](https://github.com/Abhii2404/Spendly)

---

## 🙏 Acknowledgements

- [Next.js team](https://nextjs.org/)
- [Supabase team](https://supabase.com/)
- [Lucide React icons](https://lucide.dev/)
- [Chart.js library](https://www.chartjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/) for hosting
- Finwise UI for design inspiration
