"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Define Role type locally
type Role = "STUDENT" | "SUPERVISOR" | "LECTURER" | "DEAN" | "ADMIN";

export function useAuth(requiredRole?: Role) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();

        if (requiredRole && data.role !== requiredRole) {
          router.replace("/unauthorized");
          return;
        }

        setUser(data);
      } catch {
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [requiredRole, router]);

  // Add logout function
  const logout = () => {
    localStorage.removeItem("accessToken");
    router.replace("/auth/login");
  };

  return { user, loading, logout };
}