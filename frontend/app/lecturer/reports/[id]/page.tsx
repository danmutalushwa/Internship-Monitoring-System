'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';

interface Report {
  id: number;
  title: string;
  content: string;
  status: string;
  fileUrl?: string;
  updatedAt?: string;
  student?: { name: string };
  reviewer?: { name: string };
}

interface FeedbackEntry {
  feedbackId: number;
  reviewer: { name: string };
  status: string;
  feedback: string;
  createdAt: string;
}

interface AuditLog {
  id: number;
  actor: { name: string; role: string };
  action: string;
  timestamp: string;
}

export default function LecturerReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const reportId = Number(id);

  const [report, setReport] = useState<Report | null>(null);
  const [status, setStatus] = useState('APPROVED');
  const [feedback, setFeedback] = useState('');
  const [summary, setSummary] = useState('');
  const [history, setHistory] = useState<FeedbackEntry[]>([]);
  const [activity, setActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('accessToken') || '';

  useEffect(() => {
    async function fetchAll() {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [reportRes, feedbackRes, activityRes] = await Promise.all([
          fetch(`/api/reports/${reportId}`, { headers }),
          fetch(`/api/reports/${reportId}/feedback`, { headers }),
          fetch(`/api/reports/${reportId}/activity`, { headers }),
        ]);

        if (!reportRes.ok) throw new Error('Failed to load report');
        const reportData = await reportRes.json();
        setReport(reportData);

        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json();
          setHistory(feedbackData);
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setActivity(activityData);
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      }
    }

    fetchAll();
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
      router.push('/lecturer/dashboard');
    } catch {
      toast.error('Error updating report');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}/summarize`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to generate summary');
      const data = await res.json();
      setSummary(data.summary);
    } catch {
      toast.error('AI summarization failed');
    }
  };

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!report) return <p className="p-6">Loading report...</p>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">🔍 Review Report</h1>

      <div>
        <p><strong>Student:</strong> {report.student?.name}</p>
        <p><strong>Title:</strong> {report.title}</p>
        <p><strong>Status:</strong> {report.status}</p>
        {report.reviewer?.name && <p><strong>Reviewed by:</strong> {report.reviewer.name}</p>}
        {report.updatedAt && <p><strong>Last updated:</strong> {new Date(report.updatedAt).toLocaleString()}</p>}
        {report.fileUrl && (
          <a href={report.fileUrl} target="_blank" className="text-blue-600 underline">
            📄 View Submission
          </a>
        )}
      </div>

      <div>
        <h2 className="font-semibold">📝 Report Content</h2>
        <div className="prose border rounded p-3 bg-gray-50">
          <ReactMarkdown>{report.content}</ReactMarkdown>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Decision</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded mb-4 w-full"
          >
            <option value="APPROVED">✅ Approve</option>
            <option value="REJECTED">❌ Reject</option>
          </select>

          <label className="block font-medium">Feedback (Markdown)</label>
          <TextareaAutosize
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Write feedback..."
          />
        </div>
        <div>
          <label className="block font-medium">Live Preview</label>
          <div className="prose border rounded p-2 bg-gray-50">
            <ReactMarkdown>{feedback}</ReactMarkdown>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>

      <button
        onClick={handleSummarize}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        🧠 Generate AI Summary
      </button>

      {summary && (
        <div className="mt-4">
          <h2 className="font-semibold">🧠 AI Summary</h2>
          <div className="prose border rounded p-3 bg-gray-50">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h2 className="font-semibold">🕘 Review History</h2>
          <ul className="space-y-2">
            {history.map((entry) => (
              <li key={entry.feedbackId} className="border rounded p-2 bg-gray-50">
                <p><strong>{entry.reviewer.name}</strong> — {entry.status}</p>
                <p className="italic text-gray-700">
                  <ReactMarkdown>{entry.feedback}</ReactMarkdown>
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activity.length > 0 && (
        <div>
          <h2 className="font-semibold">📊 Audit Log</h2>
          <ul className="text-sm space-y-1">
            {activity.map((log) => (
              <li key={log.id}>
                {log.actor.name} ({log.actor.role}) — {log.action} at{' '}
                {new Date(log.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}