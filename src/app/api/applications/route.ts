import { NextResponse } from "next/server";

export async function GET() {
  try {
    const mockApplications = [
      { id: "1", program: "MIT - Computer Science", status: "Pending Review", date: "2025-10-15" },
      { id: "2", program: "Harvard - Data Science", status: "Accepted", date: "2025-09-30" },
      { id: "3", program: "Oxford - Law", status: "Rejected", date: "2025-09-10" },
    ];
    return NextResponse.json({ results: mockApplications });
  } catch (error) {
    return NextResponse.json({ results: [] });
  }
}
