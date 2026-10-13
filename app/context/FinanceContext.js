"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const FinanceContext = createContext();

const API_BASE = "http://localhost:8080/api";
const TRANSACTIONS_URL = `${API_BASE}/transactions`;
const BUDGETS_URL = `${API_BASE}/budgets`;
const GOALS_URL = `${API_BASE}/goals`;

// Backend sends INCOME / EXPENSE, the UI uses Income / Expense
function transactionFromApi(t) {
  return {
    id: t.id,
    description: t.description,
    amount: Number(t.amount),
    category: t.category,
    type: t.type === "INCOME" ? "Income" : "Expense",
    date: t.date,
  };
}

function budgetFromApi(b) {
  return {
    id: b.id,
    category: b.category,
    limit: Number(b.limit),
  };
}

function goalFromApi(g) {
  return {
    id: g.id,
    name: g.name,
    target: Number(g.target),
    saved: Number(g.saved),
  };
}

export function FinanceProvider({ children }) {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);

  // Load this user's data after login, clear it after logout
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      return;
    }

    let cancelled = false;

    async function loadAll() {
      try {
        const [
          transactionsResponse,
          budgetsResponse,
          goalsResponse,
        ] = await Promise.all([
          fetch(TRANSACTIONS_URL, { credentials: "include" }),
          fetch(BUDGETS_URL, { credentials: "include" }),
          fetch(GOALS_URL, { credentials: "include" }),
        ]);

        if (transactionsResponse.ok && !cancelled) {
          const data = await transactionsResponse.json();

          // Backend sends newest first; reverse so the oldest is first
          setTransactions(data.map(transactionFromApi).reverse());
        }

        if (budgetsResponse.ok && !cancelled) {
          const data = await budgetsResponse.json();
          setBudgets(data.map(budgetFromApi));
        }

        if (goalsResponse.ok && !cancelled) {
          const data = await goalsResponse.json();
          setGoals(data.map(goalFromApi));
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function addTransaction(transaction) {
    try {
      const response = await fetch(TRANSACTIONS_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
          type: transaction.type.toUpperCase(),
          date: transaction.date,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add transaction");
      }

      const saved = await response.json();

      setTransactions((current) => [
        ...current,
        transactionFromApi(saved),
      ]);
    } catch (error) {
      console.error(error);
      alert("Could not save the transaction. Is the backend running?");
    }
  }

  async function deleteTransaction(id) {
    try {
      const response = await fetch(`${TRANSACTIONS_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      setTransactions((current) =>
        current.filter(
          (transaction) => transaction.id !== id
        )
      );
    } catch (error) {
      console.error(error);
      alert("Could not delete the transaction.");
    }
  }

  async function addBudget(budget) {
    try {
      const response = await fetch(BUDGETS_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: budget.category,
          limit: budget.limit,
        }),
      });

      if (response.status === 409) {
        alert("A budget for this category already exists");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to add budget");
      }

      const saved = await response.json();

      setBudgets((current) => [
        ...current,
        budgetFromApi(saved),
      ]);
    } catch (error) {
      console.error(error);
      alert("Could not save the budget. Is the backend running?");
    }
  }

  async function deleteBudget(id) {
    try {
      const response = await fetch(`${BUDGETS_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete budget");
      }

      setBudgets((current) =>
        current.filter(
          (budget) => budget.id !== id
        )
      );
    } catch (error) {
      console.error(error);
      alert("Could not delete the budget.");
    }
  }

  // Returns true when the goal was saved, so the form knows whether to clear
  async function addGoal(goal) {
    try {
      const response = await fetch(GOALS_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: goal.name,
          target: goal.target,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add goal");
      }

      const saved = await response.json();

      setGoals((current) => [
        ...current,
        goalFromApi(saved),
      ]);

      return true;
    } catch (error) {
      console.error(error);
      alert("Could not save the goal. Is the backend running?");
      return false;
    }
  }

  async function deleteGoal(id) {
    try {
      const response = await fetch(`${GOALS_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete goal");
      }

      setGoals((current) =>
        current.filter((goal) => goal.id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Could not delete the goal.");
    }
  }

  // Returns true when the money was added
  async function addMoneyToGoal(id, amount) {
    try {
      const response = await fetch(`${GOALS_URL}/${id}/add-money`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error("Failed to add money");
      }

      const updated = goalFromApi(await response.json());

      setGoals((current) =>
        current.map((goal) =>
          goal.id === id ? updated : goal
        )
      );

      return true;
    } catch (error) {
      console.error(error);
      alert("Could not add money to the goal.");
      return false;
    }
  }

  const totalIncome = transactions
    .filter(
      (transaction) => transaction.type === "Income"
    )
    .reduce(
      (total, transaction) =>
        total + transaction.amount,
      0
    );

  const totalExpenses = transactions
    .filter(
      (transaction) => transaction.type === "Expense"
    )
    .reduce(
      (total, transaction) =>
        total + transaction.amount,
      0
    );

  const balance = totalIncome - totalExpenses;

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        goals,

        totalIncome,
        totalExpenses,
        balance,

        addTransaction,
        deleteTransaction,

        addBudget,
        deleteBudget,

        addGoal,
        deleteGoal,
        addMoneyToGoal,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}
