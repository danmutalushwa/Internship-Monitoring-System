'use client';

import { useState } from 'react';

interface ReportFormProps {
  onSubmit: (data: { title: string; content: string; fileUrl?: string }) => void;
}

export default function ReportForm({ onSubmit }: ReportFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, fileUrl: fileUrl || undefined });
    setTitle('');
    setContent('');
    setFileUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
      <h2 className="text-lg font-semibold">📝 Submit Weekly Report</h2>

      <input
        type="text"
        placeholder="Report title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded px-3 py-2"
        required
      />

      <textarea
        placeholder="Describe your weekly progress..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border rounded px-3 py-2 h-32"
        required
      />

      <input
        type="text"
        placeholder="File URL (optional)"
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Submit Report
      </button>
    </form>
  );
}