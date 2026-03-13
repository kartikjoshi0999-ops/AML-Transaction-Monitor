import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>,
)
```
→ Commit changes

**Step 6.** Click **"Add file"** → **"Create new file"** → filename: **`src/App.jsx`** → Scroll up in this chat to the **aml-transaction-monitor.jsx** artifact I built earlier → Click on it → Copy ALL the code → Paste into GitHub → Commit changes

**Step 7.** Click **"Add file"** → **"Create new file"** → filename: **`README.md`** → paste:
```
# AML Transaction Monitor — Anti-Money Laundering Detection Engine

A rule-based transaction monitoring system for detecting suspicious financial activity, with alert management, risk scoring, and investigation workflows.

## Features

- 8 AML detection rules (large cash, structuring, rapid movement, high-risk jurisdiction, round amounts, dormant accounts, PEP, unusual patterns)
- Risk-scored alerts (0-100) with HIGH/MEDIUM/LOW classification
- Case status workflow: Open → Investigating → Escalated → SAR Filed → Closed
- Investigation notes with analyst attribution
- Geographic risk distribution with FATF flagging
- Full 250-transaction ledger with flagged highlighting
- Zero API dependencies — 100% free

## Tech Stack

React 18 · Vite · Rule-based detection algorithms

## Author

Kartik Joshi — Financial Analyst & AI Tools Enthusiast
MBA (Finance & Marketing) · Deutsche Bank · BMO
