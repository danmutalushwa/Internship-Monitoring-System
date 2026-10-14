'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface Reviewer {
  id: number;
  name: string;
  faculty: string;
}

interface ReviewerReassignProps {
  reportId: number;
  currentReviewer?: string;
  token: string;
  reviewers: Reviewer[];
  onSuccess?: () => void;
}

export default function ReviewerReassign({
  reportId,
  currentReviewer,
  token,
  reviewers,
  onSuccess,
}: ReviewerReassignProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReassign = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/reviewer`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewerId: selectedId }),
      });

      if (!res.ok) throw new Error('Failed to reassign reviewer');
      toast.success('Reviewer updated successfully');
      onSuccess?.();
    } catch {
      toast.error('Error updating reviewer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-4 bg-white shadow-sm space-y-4">
      <h3 className="font-semibold text-lg">🔄 Reassign Reviewer</h3>
      <p className="text-sm text-gray-600">
        Current: <strong>{currentReviewer || '—'}</strong>
      </p>

      <select
        value={selectedId ?? ''}
        onChange={(e) => setSelectedId(Number(e.target.value))}
        className="border p-2 rounded w-full"
      >
        <option value="">Select new reviewer</option>
        {reviewers.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name} ({r.faculty})
          </option>
        ))}
      </select>

      <button
        onClick={handleReassign}
        disabled={loading || !selectedId}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Reassigning...' : 'Confirm Reassignment'}
      </button>
    </div>
  );
}