"use client";

import { useState } from "react";

export default function TransactionForm({ onAdd }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("Expense");
  const [date, setDate] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!description || !amount || !category || !date) {
      alert("Please fill all fields");
      return;
    }

    const transaction = {
      id: Date.now(),
      description,
      amount: Number(amount),
      category,
      type,
      date,
    };

    onAdd(transaction);

    setDescription("");
    setAmount("");
    setCategory("");
    setType("Expense");
    setDate("");
  }

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <div>
        <label>Description</label>
        <input
          type="text"
          placeholder="e.g. Salary"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label>Amount</label>
        <input
          type="number"
          placeholder="e.g. 50000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div>
        <label>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select category</option>
          <option value="Salary">Salary</option>
          <option value="Food">Food</option>
          <option value="Housing">Housing</option>
          <option value="Transport">Transport</option>
          <option value="Shopping">Shopping</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
      </div>

      <div>
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <button type="submit">Add Transaction</button>
    </form>
  );
}
