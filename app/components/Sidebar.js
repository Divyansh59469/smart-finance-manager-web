"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <aside>
      <h2>Smart Finance</h2>

      <nav>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/transactions">Transactions</Link>
        <Link href="/budgets">Budgets</Link>
        <Link href="/savings">Savings Goals</Link>
      </nav>

      <div className="sidebar-user">
        <p>{user?.name}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}
