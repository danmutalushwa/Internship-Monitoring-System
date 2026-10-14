'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

interface AuditLog {
  id: number;
  actor: string;
  action: string;
  createdAt: string;
  metadata?: any;
}

export default function AuditLogDetailPage() {
  const { id } = useParams();
  const [log, setLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLog() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/admin/audit/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          toast.error('Audit log not found');
          return;
        }

        const data = await res.json();
        setLog(data);
      } catch {
        toast.error('Failed to load audit log');
      } finally {
        setLoading(false);
      }
    }

    fetchLog();
  }, [id]);

  return (
    <main className="mt-[70px] lg:mt-0 lg:ml-[250px] p-6">
      <Toaster position="top-right" />

      <h1 className="text-2xl font-bold mb-6">📄 Audit Log Details</h1>

      {loading ? (
        <p>Loading...</p>
      ) : !log ? (
        <p className="text-gray-500">Audit log not found.</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded p-6 shadow">
          <p className="text-lg font-semibold mb-4">
            Action: <span className="text-blue-600">{log.action}</span>
          </p>

          <div className="space-y-2 text-sm">
            <p>
              <strong>Actor:</strong> {log.actor}
            </p>
            <p>
              <strong>Date:</strong>{' '}
              {new Date(log.createdAt).toLocaleString()}
            </p>

            {log.metadata && (
              <div className="mt-4">
                <strong>Metadata:</strong>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <button
            onClick={() => history.back()}
            className="mt-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ← Back
          </button>
        </div>
      )}
    </main>
  );
}