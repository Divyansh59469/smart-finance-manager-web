"use client";

import { useFinance } from "../context/FinanceContext";

export default function Reports() {
  const {
    spendingByCategory,
    totalIncome,
    totalExpenses,
    balance,
  } = useFinance();

  const sortedCategories = Object.entries(
    spendingByCategory
  ).sort((a, b) => b[1] - a[1]);

  const highestExpense =
    sortedCategories.length > 0
      ? sortedCategories[0]
      : null;

  const savingsRate =
    totalIncome > 0
      ? Math.round(
          ((totalIncome - totalExpenses) /
            totalIncome) *
            100
        )
      : 0;

  return (
    <main>
      <h1>Financial Reports</h1>

      <p>
        Analyze your income, expenses and spending
        patterns.
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
          <h2>Current Balance</h2>
          <p>
            ₹{balance.toLocaleString("en-IN")}
          </p>
        </div>

        <div>
          <h2>Savings Rate</h2>
          <p>{savingsRate}%</p>
        </div>
      </section>

      <section className="transaction-card">
        <h2>Expense by Category</h2>

        {sortedCategories.length === 0 ? (
          <p>No expense data available.</p>
        ) : (
          sortedCategories.map(
            ([category, amount]) => (
              <div key={category}>
                <div className="budget-top">
                  <strong>{category}</strong>

                  <span>
                    ₹{amount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="progress-background">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${
                        totalExpenses > 0
                          ? (amount /
                              totalExpenses) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            )
          )
        )}
      </section>

      <section className="transaction-card">
        <h2>Highest Spending Category</h2>

        {highestExpense ? (
          <div>
            <h3>{highestExpense[0]}</h3>

            <p>
              ₹
              {highestExpense[1].toLocaleString(
                "en-IN"
              )}{" "}
              spent
            </p>
          </div>
        ) : (
          <p>No expense data available.</p>
        )}
      </section>

      <section className="transaction-card">
        <h2>Financial Summary</h2>

        <p>
          You earned ₹
          {totalIncome.toLocaleString("en-IN")} and
          spent ₹
          {totalExpenses.toLocaleString("en-IN")}.
        </p>

        <p>
          Your current balance is ₹
          {balance.toLocaleString("en-IN")}.
        </p>

        <p>
          Your current savings rate is{" "}
          {savingsRate}%.
        </p>
      </section>
    </main>
  );
}
