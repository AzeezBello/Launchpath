import { NextResponse } from "next/server";

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
let cachedData: any = null;
let lastFetch = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") || "nigeria";
  const field = searchParams.get("field") || "computer science";

  if (cachedData && Date.now() - lastFetch < CACHE_DURATION) {
    return NextResponse.json(cachedData);
  }

  try {
    const apis = [
      `https://api.sampleapis.net/universities/universities`, // fallback free API
      `https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json`
    ];

    const responses = await Promise.allSettled(apis.map(url => fetch(url)));
    const results: any[] = [];

    for (const res of responses) {
      if (res.status === "fulfilled") {
        const data = await res.value.json();
        results.push(...data);
      }
    }

    // Filter
    const filtered = results
      .filter((u: any) =>
        (u.name?.toLowerCase().includes(field.toLowerCase()) ||
          u.domains?.join(" ").toLowerCase().includes(field.toLowerCase())) &&
        u.country?.toLowerCase().includes(country.toLowerCase())
      )
      .slice(0, 20)
      .map((u: any, idx: number) => ({
        id: `${u.alpha_two_code}-${idx}`,
        name: u.name,
        country: u.country,
        website: u.web_pages?.[0] || u.domain || "#",
      }));

    const responseData = { results: filtered.length ? filtered : mockAdmissions };
    cachedData = responseData;
    lastFetch = Date.now();

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("Admissions API error:", err);
    return NextResponse.json({ results: mockAdmissions });
  }
}

const mockAdmissions = [
  { id: "1", name: "University of Lagos", country: "Nigeria", website: "https://unilag.edu.ng" },
  { id: "2", name: "University of Ibadan", country: "Nigeria", website: "https://ui.edu.ng" },
  { id: "3", name: "Covenant University", country: "Nigeria", website: "https://covenantuniversity.edu.ng" },
];
