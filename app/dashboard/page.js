"use client";

import { useFinance } from "../context/FinanceContext";

export default function Dashboard() {
  const {
    recentTransactions,
    totalIncome,
    totalExpenses,
    balance,
  } = useFinance();

  return (
    <main>
      <h1>Dashboard</h1>

      <p>
        Welcome to your financial dashboard.
      </p>

      <section className="summary-cards">
        <div>
          <h2>Total Income</h2>
          <p>
            ₹{totalIncome.toLocaleString("en-IN")}
          </p>
        </div>

        <div>
          <h2>Total Expenses</h2>
          <p>
            ₹{totalExpenses.toLocaleString("en-IN")}
          </p>
        </div>

        <div>
          <h2>Balance</h2>
          <p>
            ₹{balance.toLocaleString("en-IN")}
          </p>
        </div>
      </section>

      <section className="transaction-card">
        <h2>Recent Transactions</h2>

        {recentTransactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <ul>
            {recentTransactions.map((transaction) => (
                <li key={transaction.id}>
                  {transaction.description} - ₹
                  {transaction.amount.toLocaleString("en-IN")}
                </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
