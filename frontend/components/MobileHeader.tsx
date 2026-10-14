"use client";

import {
  Bell,
  Moon,
  Sun,
  Sparkles,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";


export default function MobileHeader() {
  const { user, logout } = useAuth();
  const notifications = user?.notifications ?? [];
  const aiStatus = user?.aiStatus ?? "Ready";
  

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
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
    const role = user?.role?.toLowerCase();
    if (role) {
      router.push(`/${role}/notifications`);
    } else {
      router.push("/notifications");
    }
  };

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between px-4 h-14 z-40">
      {/* Logo + Name */}
      <div className="flex items-center gap-2">
        <img src="/logo.JPG" alt="Logo" className="w-8 h-8" />
        <span className="font-bold text-lg text-gray-800 dark:text-white">
          UoK Internship
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 relative">
        {/* 🔔 Notifications */}
        <button
          onClick={goToNotifications}
          className="relative hover:text-blue-600 dark:hover:text-blue-400"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
              {notifications.length}
            </span>
          )}
        </button>

        

        {/* 🧠 AI Assistant */}
        <div className="relative" ref={aiRef}>
          <button
            onClick={() => setAiOpen(!aiOpen)}
            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
            aria-label="AI Assistant"
          >
            <Sparkles size={18} />
            {aiStatus}
          </button>

          {aiOpen && (
            <div className="absolute right-0 top-14 w-56 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-md rounded-lg py-2 z-50">
              <button
                onClick={() => router.push("/ai/summarize")}
                className="w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                🧠 Summarize Report
              </button>
              <button
                onClick={() => router.push("/ai/feedback")}
                className="w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                💬 Suggest Feedback
              </button>
              <button
                onClick={() => router.push("/ai/history")}
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
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <img
              src={user?.avatarUrl || "https://i.pravatar.cc/40"}
              alt="Profile"
              className="w-8 h-8 rounded-full border"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-14 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-md rounded-lg py-2 z-50">
              <div className="px-4 py-2 border-b dark:border-gray-700">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {user?.name || "Guest"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || "Not logged in"}
                </p>
              </div>
              <button
                onClick={goToProfile}
                className="w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User size={16} /> Profile
              </button>
              <button
                onClick={goToSettings}
                className="w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings size={16} /> Settings
              </button>
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}