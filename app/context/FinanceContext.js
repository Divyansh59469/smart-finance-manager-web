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
const OVERVIEW_URL = `${API_BASE}/reports/overview`;

const DEFAULT_QUERY = {
  page: 0,
  size: 10,
  sortField: "date",
  sortDir: "desc",
};

const EMPTY_PAGE_INFO = { totalElements: 0, totalPages: 0 };
const EMPTY_SUMMARY = { totalIncome: 0, totalExpenses: 0, balance: 0 };

function summaryFromApi(s) {
  return {
    totalIncome: Number(s.totalIncome),
    totalExpenses: Number(s.totalExpenses),
    balance: Number(s.balance),
  };
}

// { Food: 150, Rent: 200 } with real numbers instead of decimal strings
function spendingFromApi(map) {
  const result = {};
  Object.entries(map ?? {}).forEach(([category, amount]) => {
    result[category] = Number(amount);
  });
  return result;
}

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

  // One page of transactions, as chosen by the transactions screen
  const [transactions, setTransactions] = useState([]);
  const [pageInfo, setPageInfo] = useState(EMPTY_PAGE_INFO);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Numbers that used to be calculated from the full list; the server owns them now
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [spendingByCategory, setSpendingByCategory] = useState({});

  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);

  // Bumped after every change to transactions so everything derived from them reloads
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((key) => key + 1);
  }

  // The current page, reloaded when the page / size / sort changes
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setPageInfo(EMPTY_PAGE_INFO);
      return;
    }

    let cancelled = false;

    async function loadPage() {
      setTransactionsLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(query.page),
          size: String(query.size),
          sort: `${query.sortField},${query.sortDir}`,
        });

        const response = await fetch(
          `${TRANSACTIONS_URL}?${params}`,
          { credentials: "include" }
        );

        if (!response.ok || cancelled) {
          return;
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        // The last row of the last page was deleted: step back one page
        if (
          data.content.length === 0 &&
          data.page > 0 &&
          data.totalPages > 0
        ) {
          setQuery((current) => ({
            ...current,
            page: data.totalPages - 1,
          }));
          return;
        }

        setTransactions(data.content.map(transactionFromApi));
        setPageInfo({
          totalElements: data.totalElements,
          totalPages: data.totalPages,
        });
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setTransactionsLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [user, query, refreshKey]);

  // Totals, spending per category and the 5 newest rows (dashboard / reports / budgets)
  useEffect(() => {
    if (!user) {
      setSummary(EMPTY_SUMMARY);
      setSpendingByCategory({});
      setRecentTransactions([]);
      return;
    }

    let cancelled = false;

    async function loadDerived() {
      try {
        const [summaryResponse, overviewResponse, recentResponse] =
          await Promise.all([
            fetch(`${TRANSACTIONS_URL}/summary`, {
              credentials: "include",
            }),
            fetch(OVERVIEW_URL, { credentials: "include" }),
            fetch(
              `${TRANSACTIONS_URL}?page=0&size=5&sort=date,desc`,
              { credentials: "include" }
            ),
          ]);

        if (summaryResponse.ok && !cancelled) {
          setSummary(summaryFromApi(await summaryResponse.json()));
        }

        if (overviewResponse.ok && !cancelled) {
          const overview = await overviewResponse.json();
          setSpendingByCategory(
            spendingFromApi(overview.spendingByCategory)
          );
        }

        if (recentResponse.ok && !cancelled) {
          const data = await recentResponse.json();
          setRecentTransactions(data.content.map(transactionFromApi));
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadDerived();

    return () => {
      cancelled = true;
    };
  }, [user, refreshKey]);

  // Budgets and goals are small lists, loaded once per login
  useEffect(() => {
    if (!user) {
      setBudgets([]);
      setGoals([]);
      return;
    }

    let cancelled = false;

    async function loadLists() {
      try {
        const [budgetsResponse, goalsResponse] = await Promise.all([
          fetch(BUDGETS_URL, { credentials: "include" }),
          fetch(GOALS_URL, { credentials: "include" }),
        ]);

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

    loadLists();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ---- paging and sorting controls ---------------------------------------

  function setPage(page) {
    setQuery((current) => ({ ...current, page }));
  }

  function setPageSize(size) {
    setQuery((current) => ({ ...current, size, page: 0 }));
  }

  // Clicking the active column flips the direction; a new column starts ascending
  function toggleSort(field) {
    setQuery((current) => ({
      ...current,
      page: 0,
      sortField: field,
      sortDir:
        current.sortField === field && current.sortDir === "asc"
          ? "desc"
          : "asc",
    }));
  }

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

      // Jump to the first page and reload: where the new row lands depends on the sort
      setQuery((current) => ({ ...current, page: 0 }));
      refresh();
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

      refresh();
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

  const { totalIncome, totalExpenses, balance } = summary;

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        pageInfo,
        query,
        transactionsLoading,
        setPage,
        setPageSize,
        toggleSort,

        recentTransactions,
        spendingByCategory,

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
