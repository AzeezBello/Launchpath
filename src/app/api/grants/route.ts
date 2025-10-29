import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "innovation";

  try {
    const res = await fetch("https://api.publicapis.org/entries");
    const data = await res.json();

    const grants = data.entries.slice(0, 10).map((g: any, i: number) => ({
      id: String(i + 1),
      title: g.API + " Grant",
      organization: g.Auth || "Various",
      amount: "Varies",
      country: "Global",
      link: g.Link,
    }));

    return NextResponse.json({ results: grants });
  } catch (error) {
    console.error("Grants API error:", error);
    return NextResponse.json({ results: mockGrants });
  }
}

const mockGrants = [
  { id: "1", title: "UN Innovation Fund", organization: "United Nations", amount: "$50,000", country: "Global", link: "#" },
  { id: "2", title: "Google AI Research Grant", organization: "Google", amount: "$100,000", country: "Global", link: "#" },
  { id: "3", title: "African Tech Innovators Grant", organization: "Afrilabs", amount: "$25,000", country: "Africa", link: "#" },
];
