"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

// Define row structure
type ReportRow = {
  day: string;
  department: string;
  task: string;
  outcome: string;
  remark: string;
};

export default function EditReportPage() {
  const router = useRouter();
  const { id } = useParams();
  const [week, setWeek] = useState<number>(1);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then((res) => res.json())
      .then((report: { title: string; fileUrl?: string; content: string }) => {
        setWeek(Number(report.title.match(/\d+/)?.[0] || 1));
        setExistingFileUrl(report.fileUrl || "");

        const parsedRows: ReportRow[] = report.content
          .split("\n")
          .slice(2)
          .map((line: string): ReportRow => {
            const [day = "", department = "", task = "", outcome = "", remark = ""] = line
              .split("|")
              .map((c) => c.trim());
            return { day, department, task, outcome, remark };
          });

        setRows(parsedRows);
      });
  }, [id]);

  const handleSubmit = async () => {
    setLoading(true);

    const content = [
      "| Day/Date | Department/Section | Description of Activities/Tasks | Learning Outcomes | Remarks |",
      "|----------|--------------------|----------------------------------|--------------------|---------|",
      ...rows.map(
        (r: ReportRow) =>
          `| ${r.day} | ${r.department} | ${r.task} | ${r.outcome} | ${r.remark} |`
      ),
    ].join("\n");

    const formData = new FormData();
    formData.append("title", `Week ${week} Logbook`);
    formData.append("content", content);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Update failed");
      }

      toast.success("✏️ Report updated!");
      router.push("/student/reports");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">✏️ Edit Weekly Report</h1>

      <label className="block mb-2 font-medium">Week</label>
      <select
        value={week}
        onChange={(e) => setWeek(Number(e.target.value))}
        className="mb-4 p-2 border rounded"
      >
        {Array.from({ length: 8 }, (_, i) => (
          <option key={i} value={i + 1}>
            Week {i + 1}
          </option>
        ))}
      </select>

      <table className="w-full border-collapse text-sm mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Day</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">Task</th>
            <th className="border p-2">Outcome</th>
            <th className="border p-2">Remark</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="border p-2">{r.day}</td>
              <td className="border p-2">
                <input
                  value={r.department}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((row, idx) =>
                        idx === i ? { ...row, department: e.target.value } : row
                      )
                    )
                  }
                  className="w-full border rounded p-1"
                />
              </td>
              <td className="border p-2">
                <input
                  value={r.task}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((row, idx) =>
                        idx === i ? { ...row, task: e.target.value } : row
                      )
                    )
                  }
                  className="w-full border rounded p-1"
                />
              </td>
              <td className="border p-2">
                <input
                  value={r.outcome}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((row, idx) =>
                        idx === i ? { ...row, outcome: e.target.value } : row
                      )
                    )
                  }
                  className="w-full border rounded p-1"
                />
              </td>
              <td className="border p-2">
                <input
                  value={r.remark}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((row, idx) =>
                        idx === i ? { ...row, remark: e.target.value } : row
                      )
                    )
                  }
                  className="w-full border rounded p-1"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <label className="block mb-2 font-medium">Upload New File (optional)</label>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-2"
      />
      {existingFileUrl && !file && (
        <p className="text-sm text-gray-600 mb-4">
          📄 Current file:{" "}
          <a
            href={existingFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600"
          >
            View Submission
          </a>
        </p>
      )}
      {file && (
        <p className="text-sm text-gray-600 mb-4">
          📄 New file: {file.name} ({(file.size / 1024).toFixed(1)} KB)
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Updating..." : "Update Report"}
      </button>
    </div>
  );
}