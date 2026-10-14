'use client';

import { useState } from 'react';
import { getReportSummary, getSuggestedFeedback } from '../lib/api/reports';
import MarkdownPreview from './MarkdownPreview';
import CopyButton from './CopyButton';

type Role = 'STUDENT' | 'SUPERVISOR' | 'LECTURER';

interface ReportAIProps {
  reportId: number;
  role: Role;
  token: string;
}

export default function ReportAI({ reportId, role, token }: ReportAIProps) {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAI = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const output =
        role === 'STUDENT'
          ? await getReportSummary(reportId, token)
          : await getSuggestedFeedback(reportId, token);
      setResult(output);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const label = role === 'STUDENT' ? 'Summarize with AI' : 'Suggest AI Feedback';
  const title = role === 'STUDENT' ? '🧠 AI Summary' : '🧠 AI Feedback';

  return (
    <div className="mt-6 space-y-4">
      <button
        onClick={handleAI}
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        {loading ? 'Processing...' : label}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {result && (
        <div className="border rounded p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">{title}</h3>
            <CopyButton text={result} />
          </div>
          <MarkdownPreview content={result} />
        </div>
      )}
    </div>
  );
}