"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

const PUBLIC_PATHS = ["/", "/login", "/register"];

export default function AppShell({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user && !isPublic) {
      router.replace("/login");
    }

    if (user && (pathname === "/login" || pathname === "/register")) {
      router.replace("/transactions");
    }
  }, [loading, user, isPublic, pathname, router]);

  if (isPublic) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return null;
  }

  return (
    <>
      <Sidebar />
      {children}
    </>
  );
}
