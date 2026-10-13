import Link from "next/link";

export default function Home() {
  return (
    <main className="auth-page">
      <h1>Smart Finance Manager</h1>

      <p>Track your income, expenses, budgets and savings goals.</p>

      <Link href="/login">Login</Link>
      <Link href="/register">Create Account</Link>
    </main>
  );
}
