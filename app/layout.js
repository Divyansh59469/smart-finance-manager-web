import "./globals.css";
import AppShell from "./components/AppShell";
import { AuthProvider } from "./context/AuthContext";
import { FinanceProvider } from "./context/FinanceContext";

export const metadata = {
  title: "Smart Finance Manager",
  description: "Manage your personal finances",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <FinanceProvider>
            <AppShell>{children}</AppShell>
          </FinanceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
