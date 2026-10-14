'use client';

import Link from 'next/link';
import AdminSummaryCards from '../../../components/AdminSummaryCards';
import AdminSearchBar from '../../../components/AdminSearchBar';
import { useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeReviewers, setActiveReviewers] = useState(0);
  const [faculties, setFaculties] = useState(0);
  const [pendingConfigs, setPendingConfigs] = useState(0);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/admin/metrics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTotalUsers(data.totalUsers);
        setActiveReviewers(data.activeReviewers);
        setFaculties(data.faculties);
        setPendingConfigs(data.pendingConfigs);
      } catch {
        // fallback to zero
      }
    }

    fetchMetrics();
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:ml-[250px] max-w-6xl mx-auto space-y-6 py-6">
      <h1 className="text-xl sm:text-2xl font-bold">🛠️ Admin Dashboard</h1>

      {/* 🔍 Search Bar */}
      <AdminSearchBar />

      {/* 📊 Summary Cards */}
      <AdminSummaryCards
        totalUsers={totalUsers}
        activeReviewers={activeReviewers}
        faculties={faculties}
        pendingConfigs={pendingConfigs}
      />

      {/* 🧭 Navigation Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/admin/users"
          className="block p-4 bg-white border rounded shadow hover:bg-gray-50"
        >
          👥 Manage Users
        </Link>
        <Link
          href="/admin/audit"
          className="block p-4 bg-white border rounded shadow hover:bg-gray-50"
        >
          📊 View Audit Logs
        </Link>
        <Link
          href="/admin/settings"
          className="block p-4 bg-white border rounded shadow hover:bg-gray-50"
        >
          ⚙️ System Settings
        </Link>
      </div>
    </div>
  );
}