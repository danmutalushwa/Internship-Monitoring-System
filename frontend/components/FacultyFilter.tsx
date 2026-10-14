'use client';

interface FacultyFilterProps {
  value: string;
  onChange: (faculty: string) => void;
  faculties: string[];
  label?: string;
}

export default function FacultyFilter({
  value,
  onChange,
  faculties,
  label = 'Faculty',
}: FacultyFilterProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">All Faculties</option>
        {faculties.map((faculty) => (
          <option key={faculty} value={faculty}>
            {faculty}
          </option>
        ))}
      </select>
    </div>
  );
}