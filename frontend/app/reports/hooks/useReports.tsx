'use client';

import { useState, useEffect, useCallback } from 'react';

interface Report {
  id: number;
  title: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

type NewReport = Omit<Report, 'id' | 'status' | 'date'>;

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Missing access token');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch reports');

      const data = await res.json();
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitReport = async (report: NewReport) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Missing access token');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:4000/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(report),
      });

      if (!res.ok) throw new Error('Failed to submit report');

      await fetchReports(); // refresh list
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { reports, loading, error, submitting, submitReport };
}