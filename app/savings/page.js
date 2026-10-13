"use client";

import { useState } from "react";
import { useFinance } from "../context/FinanceContext";

export default function Savings() {
  const {
    goals,
    addGoal,
    deleteGoal,
    addMoneyToGoal,
  } = useFinance();

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  const [addingMoneyTo, setAddingMoneyTo] = useState(null);
  const [moneyAmount, setMoneyAmount] = useState("");

  async function handleAddGoal(e) {
    e.preventDefault();

    if (!name || !target) {
      alert("Please fill all fields");
      return;
    }

    if (Number(target) <= 0) {
      alert("Target amount must be greater than 0");
      return;
    }

    const saved = await addGoal({
      name,
      target: Number(target),
    });

    if (saved) {
      setName("");
      setTarget("");
    }
  }

  async function handleAddMoney(id) {
    const amount = Number(moneyAmount);

    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const goal = goals.find(
      (goal) => goal.id === id
    );

    if (!goal) {
      return;
    }

    if (goal.saved + amount > goal.target) {
      alert(
        `You can only add ₹${(
          goal.target - goal.saved
        ).toLocaleString("en-IN")} more.`
      );

      return;
    }

    const added = await addMoneyToGoal(id, amount);

    if (added) {
      setMoneyAmount("");
      setAddingMoneyTo(null);
    }
  }

  const totalTarget = goals.reduce(
    (total, goal) => total + goal.target,
    0
  );

  const totalSaved = goals.reduce(
    (total, goal) => total + goal.saved,
    0
  );

  const totalRemaining = totalTarget - totalSaved;

  return (
    <main>
      <h1>Savings Goals</h1>

      <p>
        Set financial goals and track your savings progress.
      </p>

      <section className="summary-cards">
        <div>
          <h2>Total Target</h2>
          <p>
            ₹{totalTarget.toLocaleString("en-IN")}
          </p>
        </div>

        <div>
          <h2>Total Saved</h2>
          <p>
            ₹{totalSaved.toLocaleString("en-IN")}
          </p>
        </div>

        <div>
          <h2>Remaining</h2>
          <p>
            ₹{totalRemaining.toLocaleString("en-IN")}
          </p>
        </div>
      </section>

      <section className="transaction-card">
        <h2>Create Savings Goal</h2>

        <form
          className="budget-form"
          onSubmit={handleAddGoal}
        >
          <div>
            <label>Goal Name</label>

            <input
              type="text"
              placeholder="e.g. New Car"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </div>

          <div>
            <label>Target Amount</label>

            <input
              type="number"
              placeholder="e.g. 100000"
              value={target}
              onChange={(e) =>
                setTarget(e.target.value)
              }
            />
          </div>

          <button type="submit">
            Add Goal
          </button>
        </form>
      </section>

      <section className="budget-list">
        <h2>My Savings Goals</h2>

        {goals.length === 0 ? (
          <p>No savings goals added yet.</p>
        ) : (
          goals.map((goal) => {
            const percentage =
              goal.target === 0
                ? 0
                : Math.round(
                    (goal.saved / goal.target) * 100
                  );

            const progress = Math.min(
              percentage,
              100
            );

            const remaining = Math.max(
              goal.target - goal.saved,
              0
            );

            const completed =
              goal.saved >= goal.target;

            return (
              <div
                className="budget-card"
                key={goal.id}
              >
                <div className="budget-top">
                  <div>
                    <h3>{goal.name}</h3>

                    <p>
                      ₹
                      {goal.saved.toLocaleString(
                        "en-IN"
                      )}{" "}
                      saved of ₹
                      {goal.target.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteGoal(goal.id)
                    }
                  >
                    Delete
                  </button>
                </div>

                <div className="progress-background">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${progress}%`,
                    }}
                  ></div>
                </div>

                <div className="budget-bottom">
                  <span>
                    {percentage}% completed
                  </span>

                  <span>
                    ₹
                    {remaining.toLocaleString(
                      "en-IN"
                    )}{" "}
                    remaining
                  </span>
                </div>

                {!completed ? (
                  <>
                    {addingMoneyTo === goal.id ? (
                      <div className="add-money-form">
                        <input
                          type="number"
                          placeholder="Enter amount"
                          value={moneyAmount}
                          onChange={(e) =>
                            setMoneyAmount(
                              e.target.value
                            )
                          }
                        />

                        <button
                          onClick={() =>
                            handleAddMoney(
                              goal.id
                            )
                          }
                        >
                          Save
                        </button>

                        <button
                          className="cancel-button"
                          onClick={() => {
                            setAddingMoneyTo(null);
                            setMoneyAmount("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="add-money-button"
                        onClick={() =>
                          setAddingMoneyTo(
                            goal.id
                          )
                        }
                      >
                        + Add Money
                      </button>
                    )}
                  </>
                ) : (
                  <div className="goal-completed">
                    🎉 Goal Completed!
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
