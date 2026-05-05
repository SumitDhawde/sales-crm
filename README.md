# Sales CRM — Full Stack

A production-grade Sales CRM with **dark/light mode**, fully **responsive** design (mobile → desktop), built with:

- **Frontend**: React 18 + TypeScript + Tailwind CSS v4 + Vite
- **Backend**: Node.js + Express + TypeScript (in-memory store)

---

## Quick Start

### 1. Install all dependencies
```bash
npm install          # installs concurrently at root
npm run install:all  # installs backend + frontend deps
```

### 2. Configure backend
```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT_SECRET at minimum
```

### 3. Run both servers
```bash
npm run dev
```

- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:3000

---

## Demo Credentials

| Role  | Email           | Password   |
|-------|-----------------|------------|
| Admin | admin@crm.com   | admin123   |
| Sales | sarah@crm.com   | sales123   |
| Sales | mark@crm.com    | sales123   |

---

## Features

### Frontend
- 🌗 **Dark / Light mode** — system preference auto-detected, persisted in localStorage
- 📱 **Fully responsive** — mobile-first, sidebar collapses to hamburger on small screens
- 🔐 **JWT auth** — protected routes, role-based access (admin vs sales)
- 📊 **Dashboard** — stat cards, Recharts pie + bar charts
- 👥 **Leads** — paginated table, mobile card view, full CRUD + search
- 💼 **Deals** — Kanban pipeline view + table view, full CRUD
- 📋 **Activities** — timeline feed, log/delete
- 🛡️ **Admin panel** — user list, all-leads view, stats breakdown (admin only)

### Backend
- Express REST API with JWT authentication
- Rate limiting (global + auth endpoints)
- Role-based authorization middleware
- In-memory data store with seeded data
- Full CRUD for leads, deals, activities
- Admin routes for cross-user data access

---

## Project Structure

```
sales-crm/
├── package.json          # root — concurrently scripts
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── types/
│   │   └── index.ts
│   └── package.json
└── frontend/             # React + Tailwind v4
    ├── src/
    │   ├── components/
    │   │   ├── layout/   # Sidebar, Layout
    │   │   └── ui/       # Shared UI components
    │   ├── context/      # AuthContext, ThemeContext
    │   ├── lib/          # API client
    │   ├── pages/        # Dashboard, Leads, Deals, Activities, Admin
    │   └── types/        # TypeScript types
    └── package.json
```

---

## API Endpoints

### Auth
| Method | Path              | Auth     |
|--------|-------------------|----------|
| POST   | /api/auth/register | Public  |
| POST   | /api/auth/login   | Public   |
| GET    | /api/auth/me      | Required |

### Leads
| Method | Path           | Auth     |
|--------|----------------|----------|
| GET    | /api/leads     | Required |
| GET    | /api/leads/:id | Required |
| POST   | /api/leads     | Required |
| PUT    | /api/leads/:id | Required |
| DELETE | /api/leads/:id | Required |

### Deals
| Method | Path                   | Auth     |
|--------|------------------------|----------|
| GET    | /api/deals             | Required |
| GET    | /api/deals/pipeline    | Required |
| POST   | /api/deals             | Required |
| PUT    | /api/deals/:id         | Required |
| DELETE | /api/deals/:id         | Required |

### Activities
| Method | Path                | Auth     |
|--------|---------------------|----------|
| GET    | /api/activities     | Required |
| POST   | /api/activities     | Required |
| DELETE | /api/activities/:id | Required |

### Admin (admin role only)
| Method | Path                | Auth      |
|--------|---------------------|-----------|
| GET    | /api/admin/stats    | Admin     |
| GET    | /api/admin/users    | Admin     |
| GET    | /api/admin/leads    | Admin     |
