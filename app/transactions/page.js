"use client";

import TransactionForm from "../components/TransactionForm";
import { useFinance } from "../context/FinanceContext";

export default function Transactions() {
  const {
    transactions,
    totalIncome,
    totalExpenses,
    balance,
    addTransaction,
    deleteTransaction,
  } = useFinance();

  return (
    <main>
      <h1>Transactions</h1>

      <p>Track your income and expenses.</p>

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
        <h2>Add New Transaction</h2>

        <TransactionForm
          onAdd={addTransaction}
        />
      </section>

      <section className="transaction-card">
        <h2>All Transactions</h2>

        {transactions.length === 0 ? (
          <p>No transactions available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>

                  <td>
                    {transaction.description}
                  </td>

                  <td>
                    {transaction.category}
                  </td>

                  <td
                    className={
                      transaction.type === "Income"
                        ? "income"
                        : "expense"
                    }
                  >
                    {transaction.type}
                  </td>

                  <td>
                    ₹
                    {transaction.amount.toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td>
                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteTransaction(
                          transaction.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
