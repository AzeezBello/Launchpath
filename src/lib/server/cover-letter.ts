import OpenAI from "openai";
import { logger } from "@/lib/logger";
import type { ResumeFormData } from "@/types/resume";

export type CoverLetterPrompt = {
  company: string;
  position: string;
  description?: string;
  tone?: string;
  /** Optional saved resume id; the route resolves it to a profile before generating. */
  resumeId?: string | null;
};

/** Compact, prompt-ready view of the applicant pulled from settings + a saved resume. */
export type ApplicantProfile = {
  name: string;
  email?: string;
  summary?: string;
  skills: string[];
  experience: { company: string; role: string; duration?: string; description?: string }[];
  education: { school: string; degree: string; year?: string }[];
  achievements: { title: string; description?: string }[];
};

export type CoverLetterResult = {
  content: string;
  source: "openai" | "fallback" | "offline-template";
};

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalize(value: string | undefined, maxLength: number) {
  return (value || "").trim().slice(0, maxLength);
}

export function sanitizeCoverLetterPrompt(payload: unknown): CoverLetterPrompt | null {
  if (!payload || typeof payload !== "object") return null;
  const raw = payload as Record<string, unknown>;

  const company = normalize(typeof raw.company === "string" ? raw.company : "", 120);
  const position = normalize(typeof raw.position === "string" ? raw.position : "", 120);
  const description = normalize(typeof raw.description === "string" ? raw.description : "", 3000);
  const tone = normalize(typeof raw.tone === "string" ? raw.tone : "professional", 40).toLowerCase();
  const resumeIdRaw = typeof raw.resumeId === "string" ? raw.resumeId.trim() : "";
  const resumeId = UUID_RE.test(resumeIdRaw) ? resumeIdRaw : null;

  if (!company || !position) return null;

  return {
    company,
    position,
    description,
    tone: tone || "professional",
    resumeId,
  };
}

export function profileFromResume(resume: ResumeFormData | null | undefined, fallbackName = ""): ApplicantProfile {
  const info = resume?.personalInfo;
  return {
    name: normalize(info?.name || fallbackName, 120),
    email: normalize(info?.email, 160) || undefined,
    summary: normalize(info?.summary, 800) || undefined,
    skills: (resume?.skills || []).map((s) => normalize(s, 60)).filter(Boolean).slice(0, 25),
    experience: (resume?.experience || [])
      .filter((e) => e && (e.company || e.role))
      .slice(0, 6)
      .map((e) => ({
        company: normalize(e.company, 120),
        role: normalize(e.role, 120),
        duration: normalize(e.duration, 60) || undefined,
        description: normalize(e.description, 500) || undefined,
      })),
    education: (resume?.education || [])
      .filter((e) => e && (e.school || e.degree))
      .slice(0, 4)
      .map((e) => ({
        school: normalize(e.school, 120),
        degree: normalize(e.degree, 120),
        year: normalize(e.year, 20) || undefined,
      })),
    achievements: (resume?.achievements || [])
      .filter((a) => a && a.title)
      .slice(0, 5)
      .map((a) => ({
        title: normalize(a.title, 120),
        description: normalize(a.description, 300) || undefined,
      })),
  };
}

function profileToPromptText(profile: ApplicantProfile) {
  const lines: string[] = [];
  if (profile.name) lines.push(`Name: ${profile.name}`);
  if (profile.summary) lines.push(`Summary: ${profile.summary}`);
  if (profile.skills.length) lines.push(`Skills: ${profile.skills.join(", ")}`);
  if (profile.experience.length) {
    lines.push("Experience:");
    for (const exp of profile.experience) {
      const head = [exp.role, exp.company].filter(Boolean).join(" at ");
      lines.push(`- ${head}${exp.duration ? ` (${exp.duration})` : ""}${exp.description ? `: ${exp.description}` : ""}`);
    }
  }
  if (profile.education.length) {
    lines.push("Education:");
    for (const edu of profile.education) {
      lines.push(`- ${[edu.degree, edu.school].filter(Boolean).join(", ")}${edu.year ? ` (${edu.year})` : ""}`);
    }
  }
  if (profile.achievements.length) {
    lines.push("Achievements:");
    for (const ach of profile.achievements) {
      lines.push(`- ${ach.title}${ach.description ? `: ${ach.description}` : ""}`);
    }
  }
  return lines.join("\n");
}

function pickHighlights(profile: ApplicantProfile) {
  const highlights: string[] = [];
  const top = profile.experience[0];
  if (top?.role && top.company) {
    highlights.push(`my experience as ${top.role} at ${top.company}`);
  }
  if (profile.skills.length) {
    highlights.push(`hands-on strength in ${profile.skills.slice(0, 4).join(", ")}`);
  }
  const edu = profile.education[0];
  if (edu?.degree && edu.school) {
    highlights.push(`my ${edu.degree} from ${edu.school}`);
  }
  return highlights;
}

export function buildFallbackLetter(
  { company, position, description = "", tone = "professional" }: CoverLetterPrompt,
  profile?: ApplicantProfile
) {
  const friendlyTone = tone ? tone.charAt(0).toUpperCase() + tone.slice(1).toLowerCase() : "Professional";
  const highlights = profile ? pickHighlights(profile) : [];

  const intro = `Dear Hiring Manager,\n\nI am excited to apply for the ${position} role at ${company}. ${friendlyTone} communication is central to how I work, and I am ready to contribute quickly.`;

  const evidence =
    highlights.length > 0
      ? `I bring ${highlights.join(", ")}, which maps closely to what this role needs.`
      : "I have delivered measurable results across product, growth, and engineering, and I enjoy collaborating with cross-functional teams.";

  const body = description
    ? `From your description, priorities include ${description}. ${evidence}`
    : evidence;

  const summaryLine = profile?.summary ? `\n\n${profile.summary}` : "";

  const closing =
    "Thank you for your consideration. I would value the opportunity to discuss how my experience can support your team.";

  const signature = profile?.name ? profile.name : "[Your Name]";

  return `${intro}\n\n${body}${summaryLine}\n\n${closing}\n\nSincerely,\n${signature}`;
}

export async function generateCoverLetter(
  payload: CoverLetterPrompt,
  profile?: ApplicantProfile
): Promise<CoverLetterResult> {
  if (openai) {
    try {
      const profileText = profile ? profileToPromptText(profile) : "";
      const prompt = `
Write a ${payload.tone} cover letter for a ${payload.position} role at ${payload.company}.

Job description:
${payload.description || "N/A"}

${profileText ? `Applicant background (use only what is relevant, never invent facts):\n${profileText}` : "No applicant background was provided; keep claims general and avoid inventing specifics."}

Requirements:
- 3 to 4 short paragraphs, under 320 words.
- Open with genuine interest in the role, then connect 2-3 concrete points from the background to the job.
- Plain, human language; no clichés like "I am writing to express".
- End with a brief call to action.
- Sign off with "Sincerely," followed by ${profile?.name ? `the applicant's name (${profile.name})` : "[Your Name]"}.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
      });

      const content = completion.choices[0]?.message?.content?.trim() || "";
      if (content) {
        return {
          content,
          source: "openai",
        };
      }
    } catch (error) {
      logger.error("OpenAI generation failed, falling back to template:", error);
    }
  }

  return {
    content: buildFallbackLetter(payload, profile),
    source: openai ? "fallback" : "offline-template",
  };
}
