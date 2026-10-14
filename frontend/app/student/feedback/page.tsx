'use client';

import { useEffect, useState } from 'react';

type FeedbackItem = {
  reportTitle: string;
  reviewer: string;
  feedback: string;
  status: 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  date: string;
};

export default function StudentFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feedback/student')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFeedbacks(data);
        else setFeedbacks([]);
      })
      .catch(() => setFeedbacks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:pl-[250px] py-6 max-w-full">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">💬 Feedback</h1>

      {loading ? (
        <p>Loading feedback...</p>
      ) : feedbacks.length === 0 ? (
        <p className="text-gray-500">No feedback received yet.</p>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((item, i) => (
            <div key={i} className="border rounded-lg p-4 shadow-sm bg-white">
              <h2 className="text-lg font-semibold">{item.reportTitle}</h2>
              <p className="text-sm text-gray-600">
                Reviewed by: {item.reviewer}
              </p>
              <p className="text-sm">Status: {item.status}</p>
              <p className="text-sm italic text-gray-700">"{item.feedback}"</p>
              <p className="text-xs text-gray-500">Date: {item.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}