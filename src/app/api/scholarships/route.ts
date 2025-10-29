import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "africa";

  try {
    // Example open dataset API
    const res = await fetch("https://raw.githubusercontent.com/benoitvallon/100-best-books/master/books.json");
    const data = await res.json();

    const scholarships = data.slice(0, 10).map((item: any, i: number) => ({
      id: String(i + 1),
      title: `${item.title} Scholarship`,
      provider: item.author,
      country: "Global",
      link: "https://www.scholarships.com/",
    }));

    return NextResponse.json({ results: scholarships });
  } catch (error) {
    console.error("Scholarships API error:", error);
    return NextResponse.json({ results: mockScholarships });
  }
}

const mockScholarships = [
  { id: "1", title: "Chevening Scholarship", provider: "UK Government", country: "UK", link: "https://www.chevening.org" },
  { id: "2", title: "DAAD Scholarship", provider: "DAAD", country: "Germany", link: "https://www.daad.de" },
  { id: "3", title: "Mastercard Foundation Scholarship", provider: "Mastercard", country: "Global", link: "https://mastercardfdn.org" },
];
