'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface SearchResult {
  type: 'user' | 'report' | 'reviewer' | 'setting';
  label: string;
  link: string;
}

const types = ['all', 'user', 'report', 'reviewer'];

export default function AdminSearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q')?.toLowerCase() || '';
  const type = searchParams.get('type') || 'all';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}&type=${type}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // ✅ Ensure results is always an array
        const safeResults = Array.isArray(data) ? data : data?.results ?? [];
        setResults(safeResults);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    if (query) fetchResults();
  }, [query, type]);

  const handleTabChange = (newType: string) => {
    router.push(`/admin/search?q=${encodeURIComponent(query)}&type=${newType}`);
  };

  // ✅ Guard reduce with Array.isArray
  const grouped = Array.isArray(results)
    ? results.reduce((acc, item) => {
        acc[item.type] = acc[item.type] || [];
        acc[item.type].push(item);
        return acc;
      }, {} as Record<string, SearchResult[]>)
    : {};

  return (
    <div className="px-4 sm:px-6 lg:px-8 lg:ml-64 max-w-6xl mx-auto py-6 space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">🔍 Search Results</h1>
      <p className="text-gray-600">
        Showing results for: <strong>{query}</strong>
      </p>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b pb-2 overflow-x-auto">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={clsx(
              'capitalize px-3 py-1 rounded-md text-sm whitespace-nowrap',
              t === type
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'text-gray-600 hover:text-blue-600'
            )}
          >
            {t === 'all' ? 'All Types' : t + 's'}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <p>Loading results...</p>
      ) : results.length === 0 ? (
        <p>No matches found.</p>
      ) : type === 'all' ? (
        Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="space-y-2 mt-6">
            <h2 className="text-md font-semibold capitalize">{group}s</h2>
            <ul className="space-y-2">
              {items.map((r, i) => (
                <li key={i}>
                  <a
                    href={r.link}
                    className="block p-4 bg-white border rounded shadow hover:bg-gray-50"
                  >
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <ul className="space-y-3 mt-4">
          {results.map((r, i) => (
            <li key={i}>
              <a
                href={r.link}
                className="block p-4 bg-white border rounded shadow hover:bg-gray-50"
              >
                {r.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}