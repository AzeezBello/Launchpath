import { NextResponse } from "next/server";

let cache: any = null;
let lastFetched = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const now = Date.now();
  if (cache && now - lastFetched < CACHE_DURATION) {
    const start = (page - 1) * limit;
    const end = start + limit;
    return NextResponse.json({
      data: cache.slice(start, end),
      total: cache.length,
      page,
      totalPages: Math.ceil(cache.length / limit),
    });
  }

  // Mock Interview Data
  const mockData = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    candidate: `Candidate ${i + 1}`,
    position: ["Frontend Developer", "UI/UX Designer", "Backend Developer"][i % 3],
    date: new Date(Date.now() + i * 86400000).toISOString().split("T")[0],
    status: ["Scheduled", "Completed", "Pending"][i % 3],
  }));

  cache = mockData;
  lastFetched = now;

  const start = (page - 1) * limit;
  const end = start + limit;

  return NextResponse.json({
    data: mockData.slice(start, end),
    total: mockData.length,
    page,
    totalPages: Math.ceil(mockData.length / limit),
  });
}
