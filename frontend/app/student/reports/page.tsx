'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type StudentReport = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NEEDS_REVISION';
  fileUrl?: string;
  feedback?: string;
  reviewer?: {
    id: number;
    name: string;
  };
};

export default function StudentReportsPage() {
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch('/api/reports/student');
        const data = await res.json();

        if (Array.isArray(data)) {
          setReports(data);
        } else if (Array.isArray(data.reports)) {
          setReports(data.reports);
        } else {
          console.warn('Unexpected reports shape:', data);
          setReports([]);
        }
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setReports([]);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = confirm('Are you sure you want to delete this report?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete');
      }

      toast.success('🗑️ Report deleted!');
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <p className="px-4 sm:px-6 lg:pl-[250px] py-6">Loading reports...</p>;

  return (
    <div className="px-4 sm:px-6 lg:pl-[250px] py-6 max-w-full">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">📘 My Internship Reports</h1>

      {reports.length === 0 ? (
        <p className="text-gray-500">No reports submitted yet.</p>
      ) : (
        <>
          <p className="text-sm text-gray-700 mb-4">
            You’ve submitted <strong>{reports.length}</strong> reports.
          </p>

          {reports.map((report) => (
            <div key={report.id} className="mb-6 border rounded-lg p-4 shadow-sm bg-white">
              <h2 className="text-lg font-semibold">{report.title}</h2>
              <p className="text-sm text-gray-600">
                Submitted: {new Date(report.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm">
                Status: <span className="font-medium">{report.status}</span>
              </p>

              {report.fileUrl && (
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  📄 Download Submission
                </a>
              )}

              {report.reviewer && (
                <p className="text-sm mt-1">
                  Reviewed by: <strong>{report.reviewer.name}</strong> —{' '}
                  {report.feedback || 'No feedback yet'}
                </p>
              )}

              {report.status === 'PENDING' && (
                <div className="mt-2 flex flex-wrap gap-4">
                  <button
                    onClick={() => router.push(`/student/reports/edit/${report.id}`)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}

              <div className="overflow-x-auto mt-4">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">Day/Date</th>
                      <th className="border p-2">Department/Section</th>
                      <th className="border p-2">Activities/Tasks</th>
                      <th className="border p-2">Learning Outcomes</th>
                      <th className="border p-2">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.content
                      .split('\n')
                      .slice(2)
                      .map((row, i) => {
                        const cols = row
                          .split('|')
                          .map((c) => c.trim())
                          .filter(Boolean);
                        return (
                          <tr key={i}>
                            {cols.map((col, j) => (
                              <td key={j} className="border p-2">
                                {col}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}