"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const API_URL = "http://localhost:8080/api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start, ask the backend who is logged in (the cookie is sent automatically)
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(`${API_URL}/me`, {
          credentials: "include",
        });

        if (response.ok) {
          setUser(await response.json());
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Returns an error message, or null when it worked
  async function authRequest(path, body) {
    try {
      const response = await fetch(`${API_URL}/${path}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setUser(await response.json());
        return null;
      }

      if (response.status === 401) {
        return "Invalid email or password";
      }

      if (response.status === 409) {
        return "This email is already registered";
      }

      if (response.status === 400) {
        return "Please check your details. The password needs 8-72 characters with a letter and a number.";
      }

      return "Something went wrong. Please try again.";
    } catch (error) {
      return "Could not reach the server. Is the backend running?";
    }
  }

  function login(email, password) {
    return authRequest("login", { email, password });
  }

  function register(name, email, password) {
    return authRequest("register", { name, email, password });
  }

  async function logout() {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error(error);
    }

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
