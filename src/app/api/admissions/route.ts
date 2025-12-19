import { admissionData } from "@/data/opportunities";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const country = (searchParams.get("country") || "").trim().toLowerCase();
  const field = (searchParams.get("field") || "").trim().toLowerCase();

  const matches = (value: string | undefined) =>
    value?.toLowerCase().includes(country) || country.length === 0;

  const matchesField = (value: string | undefined) =>
    value?.toLowerCase().includes(field) || field.length === 0;

  const filtered = admissionData.filter(
    (item) => matches(item.country) && matchesField(item.field)
  );

  return NextResponse.json({ results: filtered });
}
