'use client';

import { useEffect, useState } from 'react';

interface Settings {
  reviewDeadline: string;
  reviewerLimit: number;
  facultyMappings: Record<string, string>;
}

export default function SystemSettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/settings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSettings(data);
      } catch {
        setSettings(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      alert('Settings saved.');
    } catch {
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading settings...</p>;
  if (!settings) return <p>Failed to load settings.</p>;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium">Review Deadline</label>
        <input
          type="date"
          value={settings.reviewDeadline}
          onChange={(e) =>
            setSettings({ ...settings, reviewDeadline: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Reviewer Limit</label>
        <input
          type="number"
          value={settings.reviewerLimit}
          onChange={(e) =>
            setSettings({ ...settings, reviewerLimit: parseInt(e.target.value) })
          }
          className="border p-2 rounded w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Faculty Mappings</label>
        <textarea
          value={JSON.stringify(settings.facultyMappings, null, 2)}
          onChange={(e) =>
            setSettings({
              ...settings,
              facultyMappings: JSON.parse(e.target.value),
            })
          }
          className="border p-2 rounded w-full font-mono text-xs"
          rows={6}
        />
        <p className="text-xs text-gray-500 mt-1">
          Format: {"{ \"Computing\": \"COMP\", \"Finance\": \"FIN\" }"}
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}