import { NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

type Payload = {
  company: string;
  position: string;
  description?: string;
  tone?: string;
};

function buildFallbackLetter({ company, position, description = "", tone = "professional" }: Payload) {
  const friendlyTone = tone ? tone.charAt(0).toUpperCase() + tone.slice(1).toLowerCase() : "Professional";
  const intro = `Dear Hiring Manager,\n\nI am excited to apply for the ${position} role at ${company}. ${friendlyTone} is at the core of my work, and I am confident I can help the team move faster.`;
  const body = description
    ? `In your description you highlighted ${description}. I have shipped similar outcomes and can quickly prioritize what matters most.`
    : "I have delivered measurable results across product, growth, and engineering, and I enjoy collaborating with cross-functional teams.";
  const closing = "Thank you for your consideration. I look forward to the opportunity to discuss how my experience maps to your needs.\n\nSincerely,\n[Your Name]";

  return `${intro}\n\n${body}\n\n${closing}`;
}

export async function POST(req: Request) {
  try {
    const { company, position, description = "", tone = "professional" } = (await req.json()) as Payload;

    // Try OpenAI when configured; otherwise fall back to a deterministic template.
    if (openai) {
      try {
        const prompt = `
Write a ${tone} cover letter for a ${position} role at ${company}.
Job description: ${description}.
Make it sound personal, confident, and concise.
`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        });

        const content = completion.choices[0]?.message?.content || "";
        if (content) return NextResponse.json({ content, source: "openai" });
      } catch (error) {
        console.error("OpenAI generation failed, using fallback:", error);
      }
    }

    const fallback = buildFallbackLetter({ company, position, description, tone });
    return NextResponse.json({ content: fallback, source: openai ? "fallback" : "offline-template" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate cover letter";
    console.error(error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
