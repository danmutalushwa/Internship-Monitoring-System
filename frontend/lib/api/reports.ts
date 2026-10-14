export async function getReportSummary(reportId: number, token: string): Promise<string> {
  const res = await fetch(`/api/reports/${reportId}/summarize`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Summarization failed: ${error}`);
  }

  const data = await res.json();
  return data.summary;
}

export async function getSuggestedFeedback(reportId: number, token: string): Promise<string> {
  const res = await fetch(`/api/reports/${reportId}/suggest-feedback`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Feedback generation failed: ${error}`);
  }

  const data = await res.json();
  return data.feedback;
}