import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { company, position, description, tone } = await req.json();

  const prompt = `
  Write a ${tone} cover letter for the position of ${position} at ${company}.
  Job description: ${description}
  Emphasize enthusiasm, relevant skills, and professionalism.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const letter = completion.choices[0].message?.content || "";

  return NextResponse.json({ letter });
}
