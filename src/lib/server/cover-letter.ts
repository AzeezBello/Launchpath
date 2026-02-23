import OpenAI from "openai";

export type CoverLetterPrompt = {
  company: string;
  position: string;
  description?: string;
  tone?: string;
};

export type CoverLetterResult = {
  content: string;
  source: "openai" | "fallback" | "offline-template";
};

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

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

  if (!company || !position) return null;

  return {
    company,
    position,
    description,
    tone: tone || "professional",
  };
}

export function buildFallbackLetter({
  company,
  position,
  description = "",
  tone = "professional",
}: CoverLetterPrompt) {
  const friendlyTone = tone ? tone.charAt(0).toUpperCase() + tone.slice(1).toLowerCase() : "Professional";
  const intro = `Dear Hiring Manager,\n\nI am excited to apply for the ${position} role at ${company}. ${friendlyTone} communication is central to how I work, and I am ready to contribute quickly.`;
  const body = description
    ? `From your description, priorities include ${description}. I have delivered similar outcomes by balancing speed, collaboration, and measurable results.`
    : "I have delivered measurable results across product, growth, and engineering, and I enjoy collaborating with cross-functional teams.";
  const closing =
    "Thank you for your consideration. I would value the opportunity to discuss how my experience can support your team.\n\nSincerely,\n[Your Name]";

  return `${intro}\n\n${body}\n\n${closing}`;
}

export async function generateCoverLetter(payload: CoverLetterPrompt): Promise<CoverLetterResult> {
  if (openai) {
    try {
      const prompt = `
Write a ${payload.tone} cover letter for a ${payload.position} role at ${payload.company}.
Job description: ${payload.description || "N/A"}.
Keep it concise, human, and tailored to measurable impact.
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
      console.error("OpenAI generation failed, falling back to template:", error);
    }
  }

  return {
    content: buildFallbackLetter(payload),
    source: openai ? "fallback" : "offline-template",
  };
}
