# Portfolio Rebalancer

Simple Express + EJS + sqlite3 web app for Amit Sharma's portfolio rebalancing challenge.

## Run

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Free Deployment

This project can be deployed for free as a demo app on platforms like Koyeb or Render.

Important limitation:

- The app uses a local SQLite file: `model_portfolio.db`
- On free hosting, local disk is usually ephemeral
- That means saved rebalance history or edited model allocations may be lost after restart, redeploy, or inactivity

If this is for an interview/demo, that is usually acceptable. If you need permanent saved data, move to a paid persistent disk or switch to a hosted database.

### Option 1: Render Free Web Service

1. Push this project to GitHub
2. Sign in to Render
3. Create a new `Web Service`
4. Connect the GitHub repository
5. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Deploy

Render will detect the Express app automatically. The app already reads `PORT` from the environment.

### Option 2: Koyeb Free Web Service

1. Push this project to GitHub
2. Sign in to Koyeb
3. Create a new web service from the GitHub repo
4. Use either:
   - Native Node.js build with start command `npm start`
   - Or Docker deployment using the included `Dockerfile`
5. Deploy

### Health Check

For platforms that support health checks, use:

```text
/health
```

### Production Notes

- Keep `model_portfolio.db` committed if you want the seed data available on deploy
- Avoid multiple app instances with SQLite
- Free hosting is best for demo use, not long-term persistence

## Architecture

- `app.js`: Express bootstrap, shared template helpers, static assets, and route mounting
- `db/database.js`: small promise wrapper around the `sqlite3` driver
- `db/repository.js`: all raw SQL queries for reading clients/model funds/holdings and writing rebalance sessions/items
- `services/rebalanceService.js`: comparison and summary calculations
- `routes/pages.js`: server-rendered page routes and form submissions
- `views/`: EJS templates for comparison, holdings, history, plan editing, and error handling
- `public/styles.css`: plain CSS styling

## Calculation Logic

- The app only reads Amit Sharma from `clients`
- Total portfolio value is the sum of all Amit holdings, including off-model funds
- For each model fund:
  - `current_pct = current_value / total_portfolio_value * 100`
  - `drift_pct = target_pct - current_pct`
  - `BUY` when drift is positive, `SELL` when drift is negative, `HOLD` when drift is zero
  - `amount = abs((drift_pct / 100) * total_portfolio_value)`, rounded to the nearest rupee
- Holdings missing from `model_funds` are shown as `REVIEW` with `target_pct = null`, `amount = current_value`, and `is_model_fund = 0`
- Summary values are based on the rounded buy and sell amounts

## Routes

- `GET /comparison`: model-vs-current comparison table and summary
- `POST /comparison/save`: saves a rebalance session and rebalance items with status `PENDING`
- `GET /holdings`: Amit's current holdings and total portfolio value
- `GET /history`: saved rebalance sessions ordered newest first
- `GET /plan/edit`: editable model allocation form
- `POST /plan/edit`: validates total allocation equals exactly 100, updates `model_funds`, then redirects back to recalculated comparison

## SQL Queries Used

- `SELECT` Amit Sharma from `clients`
- `SELECT` all rows from `model_funds`
- `SELECT` Amit's rows from `client_holdings`
- `SELECT` Amit's rows from `rebalance_sessions` ordered by newest first
- `UPDATE model_funds SET allocation_pct = ? WHERE fund_id = ?`
- `INSERT INTO rebalance_sessions (...) VALUES (...)`
- `INSERT INTO rebalance_items (...) VALUES (...)`

## Edge Cases Handled

- Zero total portfolio value safely returns `0.0%` without division errors
- Model funds missing from current holdings are treated as current value `0`
- Off-model holdings still count toward portfolio value and are shown as `REVIEW`
- Allocation edit rejects invalid or negative values
- Allocation edit rejects totals that do not equal exactly `100`
- Save rebalancing uses a SQL transaction so the session and item inserts succeed or fail together
