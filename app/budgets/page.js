"use client";

import { useState } from "react";
import { useFinance } from "../context/FinanceContext";

export default function Budgets() {
  const {
    budgets,
    spendingByCategory,
    addBudget,
    deleteBudget,
  } = useFinance();

  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  function handleAddBudget(e) {
    e.preventDefault();

    if (!category || !limit) {
      alert("Please fill all fields");
      return;
    }

    if (Number(limit) <= 0) {
      alert("Budget must be greater than 0");
      return;
    }

    const alreadyExists = budgets.some(
      (budget) => budget.category === category
    );

    if (alreadyExists) {
      alert("A budget for this category already exists");
      return;
    }

    addBudget({
      id: Date.now(),
      category,
      limit: Number(limit),
    });

    setCategory("");
    setLimit("");
  }

  function getSpent(category) {
    return spendingByCategory[category] ?? 0;
  }

  const totalBudget = budgets.reduce(
    (total, budget) => total + budget.limit,
    0
  );

  const totalSpent = budgets.reduce(
    (total, budget) =>
      total + getSpent(budget.category),
    0
  );

  const totalRemaining = totalBudget - totalSpent;

  return (
    <main>
      <h1>Budgets</h1>

      <p>
        Set spending limits and track your expenses.
      </p>

      {/* Summary */}

      <section className="summary-cards">
        <div>
          <h2>Total Budget</h2>
          <p>
            ₹{totalBudget.toLocaleString("en-IN")}
          </p>
        </div>

        <div>
          <h2>Total Spent</h2>
          <p>
            ₹{totalSpent.toLocaleString("en-IN")}
          </p>
        </div>

        <div>
          <h2>Remaining</h2>
          <p>
            ₹{totalRemaining.toLocaleString("en-IN")}
          </p>
        </div>
      </section>

      {/* Add Budget */}

      <section className="transaction-card">
        <h2>Add New Budget</h2>

        <form
          className="budget-form"
          onSubmit={handleAddBudget}
        >
          <div>
            <label>Category</label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              <option value="">
                Select category
              </option>

              <option value="Food">
                Food
              </option>

              <option value="Shopping">
                Shopping
              </option>

              <option value="Transport">
                Transport
              </option>

              <option value="Entertainment">
                Entertainment
              </option>

              <option value="Housing">
                Housing
              </option>

              <option value="Education">
                Education
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          <div>
            <label>Budget Limit</label>

            <input
              type="number"
              placeholder="e.g. 10000"
              value={limit}
              onChange={(e) =>
                setLimit(e.target.value)
              }
            />
          </div>

          <button type="submit">
            Add Budget
          </button>
        </form>
      </section>

      {/* Budget List */}

      <section className="budget-list">
        <h2>My Budgets</h2>

        {budgets.length === 0 ? (
          <p>No budgets added yet.</p>
        ) : (
          budgets.map((budget) => {
            const spent = getSpent(
              budget.category
            );

            const remaining =
              budget.limit - spent;

            const percentage =
              budget.limit === 0
                ? 0
                : Math.round(
                    (spent / budget.limit) * 100
                  );

            const progress = Math.min(
              percentage,
              100
            );

            const overBudget =
              spent > budget.limit;

            return (
              <div
                className="budget-card"
                key={budget.id}
              >
                <div className="budget-top">
                  <div>
                    <h3>
                      {budget.category}
                    </h3>

                    <p>
                      ₹
                      {spent.toLocaleString(
                        "en-IN"
                      )}{" "}
                      spent of ₹
                      {budget.limit.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteBudget(
                        budget.id
                      )
                    }
                  >
                    Delete
                  </button>
                </div>

                {/* Progress Bar */}

                <div className="progress-background">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${progress}%`,
                    }}
                  ></div>
                </div>

                <div className="budget-bottom">
                  <span
                    className={
                      overBudget
                        ? "over-budget"
                        : ""
                    }
                  >
                    {percentage}% used
                  </span>

                  <span
                    className={
                      overBudget
                        ? "over-budget"
                        : ""
                    }
                  >
                    {overBudget
                      ? `₹${Math.abs(
                          remaining
                        ).toLocaleString(
                          "en-IN"
                        )} over budget`
                      : `₹${remaining.toLocaleString(
                          "en-IN"
                        )} remaining`}
                  </span>
                </div>

                {/* Warning */}

                {overBudget && (
                  <div className="budget-warning">
                    ⚠️ You have exceeded your{" "}
                    {budget.category} budget.
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}
