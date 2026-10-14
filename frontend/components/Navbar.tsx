"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react";
import { useUserContext } from "../context/userContext";


export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useUserContext();
  const notifications = user?.notifications ?? [];
  const aiStatus = user?.aiStatus ?? "Ready";


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        aiRef.current &&
        !aiRef.current.contains(event.target as Node)
      ) {
        setAiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToProfile = () => router.push("/profile");
  const goToSettings = () => router.push("/settings");

  const goToNotifications = () => {
    switch (user?.role) {
      case "ADMIN":
        router.push("/admin/notifications");
        break;
      case "DEAN":
        router.push("/dean/notifications");
        break;
      case "SUPERVISOR":
        router.push("/supervisor/notifications");
        break;
      case "LECTURER":
        router.push("/lecturer/notifications");
        break;
      case "STUDENT":
        router.push("/student/notifications");
        break;
      default:
        router.push("/notifications");
    }
  };

  const routeToAI = (path: string) => {
    const role = user?.role?.toLowerCase();
    if (role) {
      router.push(`/${role}/ai/${path}`);
    } else {
      router.push(`/ai/${path}`);
    }
  };

  if (!user) return null;

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-15 bg-white dark:bg-gray-900 shadow-sm flex justify-end items-center px-6 z-30">
      {/* 🔔 Notifications */}
      <button
        className="relative mr-4 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
        onClick={goToNotifications}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
            {notifications.length}
          </span>
        )}
      </button>


      {/* 🧠 AI Assistant Dropdown */}
      <div className="relative mr-4" ref={aiRef}>
        <button
          onClick={() => setAiOpen(!aiOpen)}
          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
          aria-label="AI Assistant"
        >
          <Sparkles size={18} />
          {aiStatus}
        </button>

        {aiOpen && (
          <div className="absolute right-0 top-10 w-56 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-md rounded-lg py-2 z-50">
            <button
              onClick={() => routeToAI("summarize")}
              className="w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              🧠 Summarize Report
            </button>
            <button
              onClick={() => routeToAI("feedback")}
              className="w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              💬 Suggest Feedback
            </button>
            <button
              onClick={() => routeToAI("history")}
              className="w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              📊 View AI Logs
            </button>
          </div>
        )}
      </div>

      {/* 👤 Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="focus:outline-none"
          aria-label="User menu"
        >
          <img
            src={user.avatarUrl || "https://i.pravatar.cc/40"}
            alt="Profile Avatar"
            className="w-8 h-8 rounded-full border"
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-md rounded-lg py-2 z-50">
            <div className="px-4 py-2 border-b dark:border-gray-700">
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
              {user.role && (
                <p className="text-xs text-gray-400 italic">
                  Role: {user.role}
                </p>
              )}
            </div>

            <button
              onClick={goToProfile}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <User size={16} /> Profile
            </button>
            <button
              onClick={goToSettings}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Settings size={16} /> Settings
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}