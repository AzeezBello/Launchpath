import OpenAI from "openai";
import { logger } from "@/lib/logger";
import type { ResumeFormData } from "@/types/resume";
import { sanitizeResumeData } from "@/lib/server/resumes";

export type TailorInput = {
  resume: ResumeFormData;
  position: string;
  company?: string;
  jobDescription: string;
};

export type TailorResult = {
  data: ResumeFormData;
  source: "openai" | "fallback";
  /** Keywords from the job description that the resume already covers / misses. */
  matched: string[];
  missing: string[];
};

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

const STOPWORDS = new Set([
  "the", "and", "for", "with", "you", "your", "our", "are", "will", "have", "has", "this", "that", "from", "into",
  "about", "who", "what", "when", "where", "which", "their", "they", "them", "than", "then", "also", "able", "well",
  "work", "working", "team", "teams", "role", "roles", "experience", "years", "year", "strong", "skills", "skill",
  "including", "across", "within", "must", "should", "would", "could", "other", "more", "most", "such", "like",
  "over", "under", "per", "any", "all", "can", "not", "but", "its", "via", "etc", "plus", "join", "help",
]);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter((t) => t.length > 2 && !STOPWORDS.has(t) && !/^\d+$/.test(t));
}

/** Top recurring keywords in a job description, most frequent first. */
export function extractKeywords(jobDescription: string, max = 25) {
  const counts = new Map<string, number>();
  for (const token of tokenize(jobDescription)) counts.set(token, (counts.get(token) || 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([word]) => word);
}

function resumeText(resume: ResumeFormData) {
  return [
    resume.personalInfo?.summary,
    ...(resume.skills || []),
    ...(resume.experience || []).flatMap((e) => [e.role, e.company, e.description]),
    ...(resume.education || []).flatMap((e) => [e.degree, e.school]),
    ...(resume.achievements || []).flatMap((a) => [a.title, a.description]),
  ]
    .filter(Boolean)
    .join(" ");
}

export function keywordCoverage(resume: ResumeFormData, jobDescription: string) {
  const keywords = extractKeywords(jobDescription);
  const have = new Set(tokenize(resumeText(resume)));
  const matched = keywords.filter((k) => have.has(k));
  const missing = keywords.filter((k) => !have.has(k));
  return { matched, missing };
}

/**
 * Deterministic tailoring when OpenAI is unavailable: reorder skills so the
 * ones the job mentions come first, and open the summary with the target role.
 */
export function tailorFallback(input: TailorInput): TailorResult {
  const { matched, missing } = keywordCoverage(input.resume, input.jobDescription);
  const keywordSet = new Set(extractKeywords(input.jobDescription));

  const skills = [...(input.resume.skills || [])];
  skills.sort((a, b) => {
    const am = tokenize(a).some((t) => keywordSet.has(t)) ? 0 : 1;
    const bm = tokenize(b).some((t) => keywordSet.has(t)) ? 0 : 1;
    return am - bm;
  });

  const target = [input.position, input.company ? `at ${input.company}` : ""].filter(Boolean).join(" ");
  const existingSummary = input.resume.personalInfo?.summary?.trim() || "";
  const summary = existingSummary.toLowerCase().includes(input.position.toLowerCase())
    ? existingSummary
    : `${target ? `Targeting the ${target} role. ` : ""}${existingSummary}`.trim();

  const data = sanitizeResumeData({
    ...input.resume,
    title: `${input.resume.title || "Resume"} — ${input.position}`,
    personalInfo: { ...input.resume.personalInfo, summary },
    skills,
  });

  return { data, source: "fallback", matched, missing };
}

const RESPONSE_SHAPE = `{
  "summary": string,            // 2-3 sentences, first person implied, targeted at the role
  "skills": string[],           // the applicant's skills, reordered with the most relevant first; you may add at most 3 that are clearly implied by their experience
  "experience": [               // same entries, same order; only "description" may change
    { "company": string, "role": string, "duration": string, "description": string }
  ]
}`;

export async function tailorResume(input: TailorInput): Promise<TailorResult> {
  if (!openai) return tailorFallback(input);

  const { matched, missing } = keywordCoverage(input.resume, input.jobDescription);

  const prompt = `You are tailoring a resume for a specific job. Rewrite ONLY the summary, the skills order, and each experience "description" so they emphasise what this job asks for. Never invent employers, titles, dates, degrees, or outcomes that are not in the original.

Target role: ${input.position}${input.company ? ` at ${input.company}` : ""}

Job description:
${input.jobDescription.slice(0, 4000)}

Original resume (JSON):
${JSON.stringify(
  {
    summary: input.resume.personalInfo?.summary || "",
    skills: input.resume.skills || [],
    experience: (input.resume.experience || []).map((e) => ({
      company: e.company,
      role: e.role,
      duration: e.duration,
      description: e.description || "",
    })),
  },
  null,
  2
)}

Rules:
- Keep every experience entry, in the same order, with the same company, role, and duration.
- Descriptions: lead with outcomes, use the job's vocabulary where it is truthful, 1-3 sentences each.
- Return ONLY a JSON object of this shape:
${RESPONSE_SHAPE}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "";
    const parsed = JSON.parse(raw) as {
      summary?: unknown;
      skills?: unknown;
      experience?: unknown;
    };

    const originalExperience = input.resume.experience || [];
    const rewritten = Array.isArray(parsed.experience) ? parsed.experience : [];

    // Trust the model only for descriptions; everything else comes from the original.
    const experience = originalExperience.map((orig, i) => {
      const candidate = (rewritten[i] || {}) as { description?: unknown };
      const description =
        typeof candidate.description === "string" && candidate.description.trim()
          ? candidate.description.trim()
          : orig.description;
      return { ...orig, description };
    });

    const skills =
      Array.isArray(parsed.skills) && parsed.skills.length > 0
        ? (parsed.skills.filter((s) => typeof s === "string") as string[])
        : input.resume.skills || [];

    const summary =
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : input.resume.personalInfo?.summary;

    const data = sanitizeResumeData({
      ...input.resume,
      title: `${input.resume.title || "Resume"} — ${input.position}`,
      personalInfo: { ...input.resume.personalInfo, summary },
      skills,
      experience,
    });

    return { data, source: "openai", matched, missing };
  } catch (error) {
    logger.error("Resume tailoring via OpenAI failed, using fallback:", error);
    return tailorFallback(input);
  }
}
