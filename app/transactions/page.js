"use client";

import TransactionForm from "../components/TransactionForm";
import { useFinance } from "../context/FinanceContext";

const PAGE_SIZES = [5, 10, 20, 50];

// Column header text and the API field it sorts by
const COLUMNS = [
  { label: "Date", field: "date" },
  { label: "Description", field: "description" },
  { label: "Category", field: "category" },
  { label: "Type", field: "type" },
  { label: "Amount", field: "amount" },
];

export default function Transactions() {
  const {
    transactions,
    pageInfo,
    query,
    transactionsLoading,
    setPage,
    setPageSize,
    toggleSort,
    totalIncome,
    totalExpenses,
    balance,
    addTransaction,
    deleteTransaction,
  } = useFinance();

  const { totalElements, totalPages } = pageInfo;

  const firstShown =
    totalElements === 0 ? 0 : query.page * query.size + 1;
  const lastShown = Math.min(
    (query.page + 1) * query.size,
    totalElements
  );

  function sortIndicator(field) {
    if (query.sortField !== field) {
      return "";
    }

    return query.sortDir === "asc" ? " ▲" : " ▼";
  }

  function ariaSort(field) {
    if (query.sortField !== field) {
      return "none";
    }

    return query.sortDir === "asc" ? "ascending" : "descending";
  }

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

        {totalElements === 0 && !transactionsLoading ? (
          <p>No transactions available.</p>
        ) : (
          <>
          <table>
            <thead>
              <tr>
                {COLUMNS.map((column) => (
                  <th
                    key={column.field}
                    className="sortable"
                    aria-sort={ariaSort(column.field)}
                    onClick={() => toggleSort(column.field)}
                  >
                    {column.label}
                    {sortIndicator(column.field)}
                  </th>
                ))}
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

          <div className="pagination">
            <span>
              {firstShown}–{lastShown} of {totalElements}
            </span>

            <label>
              Rows per page{" "}
              <select
                value={query.size}
                onChange={(e) =>
                  setPageSize(Number(e.target.value))
                }
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <div className="pagination-buttons">
              <button
                className="cancel-button"
                disabled={query.page === 0 || transactionsLoading}
                onClick={() => setPage(query.page - 1)}
              >
                Previous
              </button>

              <span>
                Page {totalPages === 0 ? 0 : query.page + 1} of{" "}
                {totalPages}
              </span>

              <button
                className="cancel-button"
                disabled={
                  query.page + 1 >= totalPages ||
                  transactionsLoading
                }
                onClick={() => setPage(query.page + 1)}
              >
                Next
              </button>
            </div>
          </div>
          </>
        )}
      </section>
    </main>
  );
}
