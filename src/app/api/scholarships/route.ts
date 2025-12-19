import { scholarshipData } from "@/data/opportunities";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") || "").trim().toLowerCase();

  const matches = (value: string | undefined) =>
    value?.toLowerCase().includes(query);

  const results =
    query.length === 0
      ? scholarshipData
      : scholarshipData.filter(
          (item) =>
            matches(item.title) ||
            matches(item.provider) ||
            matches(item.country)
        );

  return NextResponse.json({ results });
}
