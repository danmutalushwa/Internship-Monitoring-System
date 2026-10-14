'use client';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface Notification {
  id: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT';
  createdAt: string;
  link?: string;
  isRead?: boolean;
}

interface Props {
  role: string;
}

export default function NotificationList({ role }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(
          `/api/${role.toLowerCase()}/notifications?page=${page}&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        const newItems = Array.isArray(data) ? data : data.notifications ?? [];

        // ✅ FIX: Deduplicate notifications before setting state
        setNotifications((prev) => {
          const merged = [...prev, ...newItems];

          const unique = Array.from(
            new Map(merged.map((item) => [item.id, item])).values()
          );

          return unique;
        });

        setHasMore(newItems.length === 10);
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [role, page]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/${role.toLowerCase()}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );

      toast.success('Marked as read');
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/${role.toLowerCase()}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'READ') return n.isRead;
    return true;
  });

  const groupByDate = (items: Notification[]) => {
    const groups: Record<string, Notification[]> = {};
    items.forEach((n) => {
      const date = new Date(n.createdAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(n);
    });
    return groups;
  };

  const grouped = groupByDate(filtered);

  const badgeColor = {
    INFO: 'bg-green-100 text-green-800',
    WARNING: 'bg-yellow-100 text-yellow-800',
    ALERT: 'bg-red-100 text-red-800',
  };

  return (
    <main className="mt-[70px] lg:mt-0 lg:ml-[250px] p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />
      <h1 className="text-xl sm:text-2xl font-bold mb-6">🔔 {role} Notifications</h1>

      {/* Filter Controls */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {['ALL', 'UNREAD', 'READ'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-3 py-1 rounded text-sm ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading notifications...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No notifications found.</p>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{date}</h3>
            <ul className="space-y-4">
              {items.map((n) => (
                <li key={n.id} className="relative">
                  <a
                    href={n.link || '#'}
                    className="block p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${badgeColor[n.type]}`}
                      >
                        {n.type}
                      </span>
                      {!n.isRead && (
                        <span className="text-xs text-blue-600 font-medium">Unread</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-100">{n.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </a>

                  {/* Actions */}
                  <div className="mt-2 flex gap-2 text-sm">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-blue-600 hover:underline"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      {/* Pagination */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Load More
          </button>
        </div>
      )}
    </main>
  );
}