# Retain: Personal Expense and Budget Manager

Retain helps you record what you spend, set a monthly budget, and see where your money goes.

**Live application:** https://retain-expense-manager-tan.vercel.app

- **Frontend:** React, TypeScript, Vite, Redux Toolkit, React Router
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT login
- **Login and roles:** React Context only (`client/src/context/AuthContext.tsx`)
- **Search, filter, sort, page:** Redux only (`client/src/store/filtersSlice.ts`)

## Run it on your computer

You need Node 18 or newer and a MongoDB database (local, or a free MongoDB Atlas cluster).

**1. Backend**

```bash
cd server
npm install
Copy-Item .env.example .env      # PowerShell; use cp on macOS/Linux
# Edit .env: set MONGODB_URI, a long random JWT_SECRET, ADMIN_EMAIL, and ADMIN_PASSWORD
npm run seed              # creates "Uncategorized", starter categories, and the first admin
npm run dev               # API on http://localhost:5000
```

**2. Frontend** (in a second terminal)

```bash
cd client
npm install
Copy-Item .env.example .env      # PowerShell; use cp on macOS/Linux
# VITE_API_URL should point to the backend API
npm run dev               # app on http://localhost:5173
```

Sign in as the admin you set in `server/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). The seed command intentionally requires both values; it will not create a default, publicly guessable admin password.
Anyone who signs up in the app becomes a normal user. The app never lets a sign-up choose its own role.

## What each part does

| Folder | Purpose |
| --- | --- |
| `server/src/models` | Database shapes: User, Category, Expense, Budget |
| `server/src/routes` | API endpoints (below) |
| `server/src/middleware` | `protect` (must be signed in), `adminOnly`, error messages |
| `client/src/context` | AuthContext: sign up, sign in, sign out, role |
| `client/src/store` | Redux: all filter, search, sort and page state |
| `client/src/components` | Reusable pieces: form, filters, list, pagination, budget gauge |
| `client/src/pages` | Screens: dashboard, expenses, expense detail, admin |

## API endpoints

All routes except sign up and sign in need `Authorization: Bearer <token>`.

Send protected requests with `Authorization: Bearer <token>`, using the token returned by sign-in or sign-up.

| Method and path | Who | What |
| --- | --- | --- |
| `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me` | anyone / signed in | Accounts |
| `GET /api/expenses` | user | My expenses. Query: `q, category, paymentMethod, from, to, minAmount, maxAmount, sortBy (date or amount), order (asc or desc), page, limit` |
| `GET/POST /api/expenses`, `GET/PUT/DELETE /api/expenses/:id` | user | My expenses only |
| `GET /api/budgets?month=YYYY-MM`, `PUT /api/budgets` | user | My monthly budget |
| `GET /api/dashboard?month=YYYY-MM` | user | Total spent, remaining, status, highest expense, by category, recent |
| `GET /api/categories` | user | List categories |
| `POST /api/categories`, `PUT/DELETE /api/categories/:id` | admin | Manage categories |
| `GET /api/admin/insights` | admin | Platform numbers |
| `GET /api/health` | anyone | API health check |

## Rules worth knowing

- **Deleting a category** moves its expenses to "Uncategorized". The default category cannot be renamed or deleted.
- **Budget status:** "within" below 80% used, "approaching" from 80% up to the budget, "over" above it.
- **Privacy:** every expense query includes the signed-in user's id, so nobody can read or change another user's data, even by guessing an id.
- **Currency:** shown in RWF. Change `CURRENCY` in `client/src/config.ts`.

## Deploy

1. **Database:** create a free MongoDB Atlas cluster and add the backend host's outbound IP ranges to its IP Access List.
2. **Backend (Render):** use the included `render.yaml` or configure a Node web service with root directory `server`, build command `npm ci`, and start command `npm start`. Set `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL` in the service environment.
3. **Frontend (Vercel or Netlify):** root folder `client`, build command `npm run build`, output folder `dist`. Set `VITE_API_URL` to `https://your-backend-address/api`. The included `vercel.json` and `public/_redirects` make page refreshes work.
4. Verify the API at `https://your-backend-address/api/health`, then sign in and test expense creation and refresh navigation on the live frontend.

For the hosted admin account, sign up in the app with the configured `ADMIN_EMAIL` and the password you choose. Render's free plan does not provide a shell, so to promote that existing account, temporarily set `ADMIN_PASSWORD` in Render and set the service's Pre-Deploy Command to `npm run seed`. Deploy once, then remove the temporary password and pre-deploy command. The seed script promotes the existing account without changing its sign-up password.
