![CI](https://github.com/Divyansh59469/smart-finance-manager-web/actions/workflows/ci.yml/badge.svg)

# Smart Finance Manager Web

Next.js frontend for the [Smart Finance Manager API](https://github.com/Divyansh59469/smart-finance-manager-api). Register, log in, track transactions, set budgets and savings goals, and read spending reports.

## Features

- **Auth:** register, login and logout against the API (httpOnly cookie, no token handling in the browser).
- **Transactions:** add and delete transactions in a table with **server-side pagination**, a rows-per-page selector and **sortable columns** (date, description, category, type, amount).
- **Dashboard:** income, expenses, balance and the five newest transactions.
- **Budgets:** one limit per category with live spent / remaining figures.
- **Savings goals:** create goals and add money until the target is reached.
- **Reports:** spending by category, highest category and savings rate.
- **API Docs:** sidebar link to the API's Swagger UI.

All totals are calculated by the API (`/api/transactions/summary` and `/api/reports/overview`), so they stay correct no matter how many pages of transactions exist.

## Getting started

Prerequisites: Node.js 20 or newer, and the API running on <http://localhost:8080> (see its README).

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Passwords must be 8 to 72 characters with at least one letter and one digit.

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

## Notes

- The API address (`http://localhost:8080`) is set in `app/context/AuthContext.js` and `app/context/FinanceContext.js`. The API only allows requests from `http://localhost:3000` (see `SecurityConfig`).
- Built with Next.js 15 (App Router), React 19 and plain CSS.