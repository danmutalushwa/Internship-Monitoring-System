"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface Notification {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  link?: string;
  isRead?: boolean;
}

interface JwtPayload {
  sub: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "STUDENT" | "SUPERVISOR" | "LECTURER" | "DEAN" | "ADMIN";
  notifications?: Notification[];
  aiStatus?: string;
}

interface UserContextType {
  user: JwtPayload | null;
  setUser: (user: JwtPayload | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const useUserContext = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUser(decoded);
      } catch {
        setUser(null);
      }
    }
  }, []);
   
  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}