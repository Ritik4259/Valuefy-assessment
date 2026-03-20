Ritik, here’s a **clean, professional README** you can directly paste into your GitHub repo 👇

---

# 📊 Portfolio Rebalancing Web App (Valuefy Assessment)

## 🚀 Overview

This project is a **portfolio rebalancing web application** built as part of the Valuefy assessment.

The application helps a client (**Amit Sharma**) compare his **current mutual fund holdings** with an advisor’s **recommended model portfolio** and generates actionable insights on:

* What to **BUY**
* What to **SELL**
* What requires **REVIEW**

It also allows:

* Saving rebalancing recommendations
* Viewing historical recommendations
* Editing the target allocation plan dynamically

---

## 🧠 Problem Statement

Over time, market fluctuations cause a portfolio to **drift away** from its target allocation.

This app solves that by:

1. Comparing **current vs target allocation**
2. Calculating **drift**
3. Suggesting **BUY / SELL actions with exact amounts**
4. Allowing users to **rebalance and track decisions**

---

## ⚙️ Tech Stack

* **Backend:** Node.js, Express
* **Database:** SQLite (provided)
* **Templating Engine:** EJS
* **Frontend:** HTML, CSS
* **Deployment:** Render

---

## 🗂️ Project Structure

```bash
project/
│── app.js
│── package.json
│── model_portfolio.db
│
├── db/
│   ├── database.js
│   ├── repository.js
│
├── routes/
│   └── pages.js
│
├── services/
│   └── rebalanceService.js
│
├── views/
│   ├── comparison.ejs
│   ├── holdings.ejs
│   ├── history.ejs
│   ├── plan-edit.ejs
│   ├── error.ejs
│   └── partials/
│
├── public/
│   └── styles.css
```

---

## 📊 Core Features

### 1. Portfolio Comparison (Main Screen)

* Displays:

  * Current %
  * Target %
  * Drift
  * Action (BUY / SELL / REVIEW)
  * Amount (₹)
* Summary:

  * Total BUY
  * Total SELL
  * Net cash required

---

### 2. Current Holdings

* Shows all investments of Amit Sharma
* Displays total portfolio value

---

### 3. Rebalancing History

* Tracks saved recommendations
* Shows:

  * Date
  * Portfolio value
  * Buy/Sell summary
  * Status

---

### 4. Edit Model Portfolio

* Modify allocation percentages
* Validation:

  * Must sum to **100%**
* Automatically recalculates recommendations

---

## 🔢 Calculation Logic

### Step 1: Total Portfolio Value

```text
Total = sum of all current holdings (including non-model funds)
```

### Step 2: Current Allocation

```text
current % = (current_value / total_portfolio_value) × 100
```

### Step 3: Drift

```text
drift = target % - current %
```

### Step 4: Action

* drift > 0 → BUY
* drift < 0 → SELL
* fund not in model → REVIEW

### Step 5: Amount

```text
amount = |drift % × total_portfolio_value|
```

---

## ⚠️ Edge Cases Handled

* ✅ Fund in model but **no current investment (0 value)**
* ✅ Fund in holdings but **not in model → REVIEW**
* ✅ Uses **current portfolio value**, not invested amount
* ✅ Validation: allocation must equal **100%**

---

## 💾 Database Usage

### Read from:

* `clients`
* `model_funds`
* `client_holdings`

### Write to:

* `rebalance_sessions`
* `rebalance_items`

### Save Flow:

* 1 entry in `rebalance_sessions`
* Multiple entries in `rebalance_items` (one per fund)

---

## 🖥️ Screens

| Page          | Description                |
| ------------- | -------------------------- |
| `/comparison` | Main rebalancing dashboard |
| `/holdings`   | Current investments        |
| `/history`    | Past recommendations       |
| `/plan/edit`  | Edit allocation            |

---

## ▶️ How to Run Locally

### 1. Clone the repo

```bash
git clone https://github.com/Ritik4259/Valuefy-assessment.git
cd Valuefy-assessment
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the app

```bash
npm start
```

### 4. Open in browser

```text
http://localhost:3000
```

---

## 🌐 Deployment

The app is deployed using **Render**.

### Deployment Steps:

* Create Web Service on Render
* Connect GitHub repo
* Build: `npm install`
* Start: `npm start`

---

## ⚠️ Note on SQLite

This project uses SQLite as required by the assessment.

For production systems:

* SQLite is not ideal for scalability
* Recommended upgrade → PostgreSQL / MySQL

---

## 🤖 Use of AI Tools

AI tools were used for:

* speeding up development
* structuring code
* improving efficiency

However:

* All logic was validated manually
* Calculations were verified against expected outputs
* Code structure and decisions were understood and controlled

---

## 🎯 Key Highlights

* Clean separation of logic (routes, services, DB)
* Accurate financial calculations
* Proper handling of edge cases
* Simple, explainable architecture
* Fully functional end-to-end flow

---

## 📌 Future Improvements

* User authentication
* Multi-client support
* Graph-based visualization
* Export reports (PDF/CSV)
* Migration to scalable DB

---

## 👨‍💻 Author

**Ritik**
B.Tech CSE (AI & ML)
Lovely Professional University


* shorten this for interview submission
* or make a **one-page executive README (very impressive for recruiters)**
