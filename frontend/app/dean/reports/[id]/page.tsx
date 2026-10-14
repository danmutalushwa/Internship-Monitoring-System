'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import MarkdownPreview from '../../../../components/MarkdownPreview';
import CopyButton from '../../../../components/CopyButton';

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
  id: number;
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

// Decode JWT to extract userId
function getUserIdFromToken(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

export default function DeanReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const reportId = Number(id);

  const [report, setReport] = useState<Report | null>(null);
  const [summary, setSummary] = useState('');
  const [aiFeedback, setAiFeedback] = useState(''); 
  const [history, setHistory] = useState<FeedbackEntry[]>([]);
  const [activity, setActivity] = useState<AuditLog[]>([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('accessToken') || ''
      : '';

  const userId = token ? getUserIdFromToken(token) : null;

  // Fetch report + history + activity
  useEffect(() => {
    async function fetchAll() {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [reportRes, feedbackRes, activityRes] = await Promise.all([
          fetch(`/api/dean/reports/${reportId}`, { headers }),
          fetch(`/api/dean/reports/${reportId}/feedback`, { headers }),
          fetch(`/api/dean/reports/${reportId}/activity`, { headers }),
        ]);

        if (!reportRes.ok) throw new Error('Failed to load report');
        setReport(await reportRes.json());

        if (feedbackRes.ok) setHistory(await feedbackRes.json());
        if (activityRes.ok) setActivity(await activityRes.json());
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      }
    }

    fetchAll();
  }, [reportId, token]);

  // AI Summary
  const handleSummarize = async () => {
    console.log("✅ Button clicked");
    console.log("userId =", userId);
    console.log("token =", token);
    console.log("reportId =", reportId);

    if (!userId) {
      toast.error('User ID missing — please log in again');
      return;
    }

    try {
      const res = await fetch(`/api/dean/reports/${reportId}/summarize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error('Failed to generate summary');

      const data = await res.json();
      setSummary(data.summary);
    } catch {
      toast.error('AI summarization failed');
    }
  };

  // AI Feedback Suggestion
  const handleAiFeedback = async () => {
    if (!userId) {
      toast.error('User ID missing — please log in again');
      return;
    }

    try {
      const res = await fetch(`/api/dean/reports/${reportId}/suggest-feedback`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error('Failed to generate AI feedback');

      const data = await res.json();
      setAiFeedback(data.feedback);
    } catch {
      toast.error('AI feedback generation failed');
    }
  };

  // Approve / Reject
  const handleStatusChange = async (newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/dean/reports/${reportId}/status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setReport((prev) => (prev ? { ...prev, status: newStatus } : prev));
      toast.success(`Report ${newStatus.toLowerCase()}`);
    } catch {
      toast.error('Failed to update report status');
    }
  };

  // Submit feedback
  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return;

    try {
      const res = await fetch(`/api/dean/reports/${reportId}/feedback`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });

      if (!res.ok) throw new Error('Failed to submit feedback');

      toast.success('Feedback submitted');
      setFeedback('');

      // Refresh history
      const updated = await fetch(`/api/dean/reports/${reportId}/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(await updated.json());
    } catch {
      toast.error('Failed to submit feedback');
    }
  };

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!report) return <p className="p-6">Loading report...</p>;

  // Dedupe feedback history
  const uniqueHistory = Array.from(
    new Map(history.map((h) => [h.id, h])).values()
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 lg:ml-[250px] max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">📄 Report Detail</h1>

      {/* Report Metadata */}
      <div>
        <p><strong>Student:</strong> {report.student?.name}</p>
        <p><strong>Title:</strong> {report.title}</p>
        <p><strong>Status:</strong> {report.status}</p>
        {report.reviewer?.name && (
          <p><strong>Reviewer:</strong> {report.reviewer.name}</p>
        )}
        {report.updatedAt && (
          <p>
            <strong>Last updated:</strong>{' '}
            {new Date(report.updatedAt).toLocaleString()}
          </p>
        )}
        {report.fileUrl && (
          <a
            href={report.fileUrl}
            target="_blank"
            className="text-blue-600 underline"
          >
            📄 View Submission
          </a>
        )}
      </div>

      {/* Report Content */}
      <div>
        <h2 className="font-semibold">📝 Report Content</h2>
        <div className="prose border rounded p-3 bg-gray-50">
          <ReactMarkdown>{report.content}</ReactMarkdown>
        </div>
      </div>

      {/* AI Summary */}
      <button
        onClick={handleSummarize}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        🧠 Generate AI Summary
      </button>

      {summary && (
        <div className="mt-4 border rounded p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">🧠 AI Summary</h3>
            <CopyButton text={summary} />
          </div>
          <MarkdownPreview content={summary} />
        </div>
      )}

      {/* AI Feedback Suggestion */}
      <button
        onClick={handleAiFeedback}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        💡 Generate AI Feedback Suggestion
      </button>

      {aiFeedback && (
        <div className="mt-4 border rounded p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">💡 AI Feedback Suggestion</h3>
            <CopyButton text={aiFeedback} />
          </div>
          <MarkdownPreview content={aiFeedback} />
        </div>
      )}

      {/* Dean Feedback */}
      <div className="space-y-2">
        <h2 className="font-semibold">💬 Add Feedback</h2>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="border rounded w-full p-2"
          rows={4}
          placeholder="Write feedback for this report..."
        />
        <button
          onClick={handleFeedbackSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Feedback
        </button>
      </div>

      {/* Approve / Reject */}
      <div className="flex gap-3">
        <button
          onClick={() => handleStatusChange('APPROVED')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ✅ Approve
        </button>
        <button
          onClick={() => handleStatusChange('REJECTED')}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          ❌ Reject
        </button>
      </div>

      {/* Review History */}
      {uniqueHistory.length > 0 && (
        <div>
          <h2 className="font-semibold">🕘 Review History</h2>
          <ul className="space-y-2">
            {uniqueHistory.map((entry) => (
              <li key={entry.id} className="border rounded p-2 bg-gray-50">
                <p>
                  <strong>{entry.reviewer.name}</strong> — {entry.status}
                </p>
                <div className="italic text-gray-700">
                  <ReactMarkdown>{entry.feedback}</ReactMarkdown>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Audit Log */}
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