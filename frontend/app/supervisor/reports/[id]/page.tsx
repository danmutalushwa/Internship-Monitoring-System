'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ReportAI from '../../../../components/ReportAI';

interface Report {
  id: number;
  title: string;
  content: string;
  status: string;
  fileUrl?: string;
  student?: { name: string };
}

export default function SupervisorReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const reportId = Number(id);

  const [report, setReport] = useState<Report | null>(null);
  const [status, setStatus] = useState('APPROVED');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('accessToken') || '';

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load report');
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      }
    }

    fetchReport();
  }, [reportId, token]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, feedback }),
      });

      if (!res.ok) throw new Error('Failed to update report');
      toast.success(`Report ${status.toLowerCase()}!`);
      router.push('/supervisor/dashboard');
    } catch (err) {
      toast.error('Error updating report');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!report) return <p className="p-6">Loading report...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">🔍 Review Report</h1>
      <p className="text-sm text-gray-600 mb-2">
        Student: <strong>{report.student?.name}</strong>
      </p>
      <p className="text-sm mb-2">Title: {report.title}</p>
      <p className="text-sm mb-2">Status: {report.status}</p>
      {report.fileUrl && (
        <a
          href={report.fileUrl}
          target="_blank"
          className="text-blue-600 underline text-sm"
        >
          📄 View Submission
        </a>
      )}

      <div className="mt-6">
        <ReportAI reportId={report.id} role="SUPERVISOR" token={token} />
      </div>

      <div className="mt-8">
        <label className="block mb-1 font-medium">Decision</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded mb-4 w-full"
        >
          <option value="APPROVED">✅ Approve</option>
          <option value="REJECTED">❌ Reject</option>
        </select>

        <label className="block mb-1 font-medium">Feedback</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          className="w-full border rounded p-2 mb-4"
          placeholder="Write feedback for the student..."
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>

        <button
          onClick={() => router.push('/supervisor/reports')}
          className="ml-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to Reports
        </button>
      </div>
    </div>
  );
}