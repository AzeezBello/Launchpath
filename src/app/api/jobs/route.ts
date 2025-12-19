import { jobData } from "@/data/opportunities";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") || "").trim().toLowerCase();

  const matches = (value: string | undefined) =>
    value?.toLowerCase().includes(query);

  const results =
    query.length === 0
      ? jobData
      : jobData.filter(
          (item) =>
            matches(item.title) ||
            matches(item.company) ||
            matches(item.location) ||
            matches(item.type)
        );

  return NextResponse.json({ results });
}
