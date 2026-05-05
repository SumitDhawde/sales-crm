# Sales CRM — Backend API

Node.js + TypeScript REST API for the Sales CRM system.

## Stack

| Layer | Tech |
|-------|------|
| Runtime | Node.js 18+ |
| Language | TypeScript 5 |
| Framework | Express 4 |
| Auth | JWT (jsonwebtoken) |
| Hashing | bcryptjs |
| Validation | express-validator |
| Rate Limiting | express-rate-limit |
| Storage | In-memory (no DB required) |

---

## Project Structure

```
src/
├── index.ts                  # App entry point & server bootstrap
├── types/
│   └── index.ts              # Shared TypeScript interfaces
├── models/
│   └── store.ts              # In-memory data store + seed data
├── middleware/
│   ├── auth.ts               # JWT authenticate + authorize guards
│   ├── errorHandler.ts       # Central AppError + global error handler
│   └── validators.ts         # express-validator rule sets
├── controllers/
│   ├── authController.ts     # register, login, getMe
│   ├── leadController.ts     # CRUD + search + filter + pagination
│   ├── dealController.ts     # CRUD + pipeline view
│   ├── activityController.ts # CRUD activity log
│   └── adminController.ts    # Admin-only: users, stats, all leads
├── routes/
│   └── index.ts              # All route definitions with middleware
└── utils/
    └── helpers.ts            # signToken, paginate, parsePagination
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env

# 3. Start dev server (hot-reload)
npm run dev

# 4. Build for production
npm run build && npm start
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `JWT_SECRET` | `secret` | JWT signing secret (change in prod!) |
| `JWT_EXPIRES_IN` | `7d` | Token TTL |
| `NODE_ENV` | `development` | Environment |
| `FRONTEND_URL` | `*` | CORS allowed origin |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `200` | Max requests per window |

---

## Seed Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@crm.com | admin123 | admin |
| sarah@crm.com | sales123 | sales |
| mark@crm.com | sales123 | sales |

---

## API Reference

All endpoints are prefixed with `/api`.  
Protected routes require: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Login, receive JWT |
| `GET` | `/auth/me` | 🔒 Any | Get current user profile |

**Register body:**
```json
{ "name": "Alice", "email": "alice@example.com", "password": "secret123", "role": "sales" }
```

**Login body:**
```json
{ "email": "alice@example.com", "password": "secret123" }
```

**Response (both):**
```json
{
  "success": true,
  "token": "<JWT>",
  "user": { "id": "...", "name": "Alice", "email": "...", "role": "sales" }
}
```

---

### Leads

Sales users only see their own leads. Admins see all.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/leads` | 🔒 Any | List leads (paginated, filterable) |
| `GET` | `/leads/:id` | 🔒 Any | Lead detail with deals & activities |
| `POST` | `/leads` | 🔒 Any | Create lead |
| `PUT` | `/leads/:id` | 🔒 Any | Update lead |
| `DELETE` | `/leads/:id` | 🔒 Any | Delete lead (cascades to deals & activities) |

**Query params for `GET /leads`:**
- `search` — full-text search on name, email, company
- `status` — `new | contacted | qualified | proposal | converted | lost`
- `source` — filter by source string
- `page` — default `1`
- `limit` — default `10`, max `100`

**Create/Update body fields:**
```json
{
  "name": "John Smith",
  "email": "john@company.com",
  "phone": "+1-555-0101",
  "company": "Acme Corp",
  "status": "new",
  "source": "LinkedIn",
  "notes": "Interested in enterprise plan"
}
```

**Lead statuses:** `new` → `contacted` → `qualified` → `proposal` → `converted` / `lost`

---

### Deals

Each deal belongs to a lead. Deal stages form the sales pipeline.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/deals` | 🔒 Any | List deals (filterable by stage/leadId) |
| `GET` | `/deals/pipeline` | 🔒 Any | Pipeline grouped by stage + stats |
| `GET` | `/deals/lead/:leadId` | 🔒 Any | Deals for a specific lead |
| `POST` | `/deals` | 🔒 Any | Create deal |
| `PUT` | `/deals/:id` | 🔒 Any | Update deal (stage, value, etc.) |
| `DELETE` | `/deals/:id` | 🔒 Any | Delete deal |

**Create body:**
```json
{
  "leadId": "<uuid>",
  "title": "Enterprise License",
  "value": 50000,
  "stage": "prospect",
  "expectedCloseDate": "2024-12-31",
  "notes": "Pending legal review"
}
```

**Deal stages:** `prospect` → `negotiation` → `won` / `lost`

**Pipeline response:**
```json
{
  "success": true,
  "data": {
    "pipeline": {
      "prospect": [...],
      "negotiation": [...],
      "won": [...],
      "lost": [...]
    },
    "stats": {
      "totalDeals": 10,
      "totalValue": 150000,
      "wonValue": 50000,
      "activeValue": 80000,
      "winRate": 67
    }
  }
}
```

---

### Activities

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/activities` | 🔒 Any | List activities (filterable by leadId, type) |
| `GET` | `/activities/:id` | 🔒 Any | Single activity |
| `POST` | `/activities` | 🔒 Any | Log new activity |
| `DELETE` | `/activities/:id` | 🔒 Any | Delete activity |

**Create body:**
```json
{
  "leadId": "<uuid>",
  "type": "call",
  "title": "Discovery Call",
  "description": "Discussed requirements and budget",
  "date": "2024-11-15T10:00:00Z"
}
```

**Activity types:** `call` | `meeting` | `note` | `follow-up`

---

### Admin (admin role only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/stats` | 🔒 Admin | Full dashboard stats |
| `GET` | `/admin/users` | 🔒 Admin | All users with lead/deal counts |
| `GET` | `/admin/users/:id` | 🔒 Admin | User detail with all their leads, deals, activities |
| `GET` | `/admin/leads` | 🔒 Admin | All leads across all users (searchable/filterable) |

---

## Error Responses

All errors follow this shape:
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

Validation errors include an `errors` array:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Valid email is required" }
  ]
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Missing or invalid JWT |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already registered) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Architecture Notes

- **MVC structure** — controllers → routes → middleware, clean separation
- **Central error handler** — all errors flow through `AppError` + `errorHandler`
- **Role-based access** — `authenticate` validates JWT; `authorize('admin')` checks role
- **Input validation** — all mutation endpoints use `express-validator` rule sets
- **Cascade deletes** — deleting a lead removes its deals and activities
- **Rate limiting** — global (200 req/15 min) + strict auth limiter (20 req/15 min)
- **No database** — data lives in module-level arrays; swap for a real DB by replacing `src/models/store.ts`
