import type { ApplicationStatus, EmailDetection } from "@/types";

const PROMPT = `Analyze this email for job application updates. Return JSON only with shape {"detected":[...]}.
Each item: company_name, role (optional), status (applied|interview|offer|rejected|accepted|unknown), summary (optional), interview_date (ISO or empty).
If unrelated to job applications, return {"detected":[]}.`;

export async function scanEmailContent(emailBody: string): Promise<EmailDetection[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim();
  const baseUrl = import.meta.env.VITE_OPENAI_BASE_URL || "https://api.openai.com/v1";

  if (!apiKey) {
    return mockDetect(emailBody);
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: PROMPT },
        { role: "user", content: emailBody },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI scan failed (${res.status}): ${err.slice(0, 120)}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned empty response");

  let parsed: { detected?: EmailDetection[] };
  try {
    parsed = typeof content === "string" ? JSON.parse(content) : content;
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  return (parsed.detected ?? []).map(normalizeDetection);
}

function normalizeDetection(d: EmailDetection): EmailDetection {
  const status = d.status === "unknown" ? "applied" : d.status;
  return { ...d, status: status as ApplicationStatus };
}

function mockDetect(text: string): EmailDetection[] {
  const lower = text.toLowerCase();
  const results: EmailDetection[] = [];
  if (lower.includes("interview")) {
    results.push({
      company_name: extractCompany(text) || "Unknown Company",
      role: "Software Engineer",
      status: "interview",
      summary: "Interview invitation detected (demo mode — add VITE_OPENAI_API_KEY for real AI).",
      interview_date: "",
    });
  }
  if (lower.includes("offer") || lower.includes("congratulations")) {
    results.push({
      company_name: extractCompany(text) || "Unknown Company",
      status: "offer",
      summary: "Offer detected (demo mode).",
    });
  }
  if (lower.includes("regret") || lower.includes("not moving forward") || lower.includes("rejected")) {
    results.push({
      company_name: extractCompany(text) || "Unknown Company",
      status: "rejected",
      summary: "Rejection detected (demo mode).",
    });
  }
  if (results.length === 0 && (lower.includes("application") || lower.includes("applied"))) {
    results.push({
      company_name: extractCompany(text) || "Unknown Company",
      status: "applied",
      summary: "Application update detected (demo mode).",
    });
  }
  return results;
}

function extractCompany(text: string): string | null {
  const m = text.match(/at\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+on|\s+for|\.|,)/);
  return m?.[1]?.trim() ?? null;
}
