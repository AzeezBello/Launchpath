import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "developer";

  try {
    // Using a reliable dummy jobs API
    const res = await fetch("https://remotive.com/api/remote-jobs?search=" + query);
    const data = await res.json();

    const jobs = data.jobs?.slice(0, 12).map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location,
      type: job.job_type,
      link: job.url,
    }));

    return NextResponse.json({ results: jobs.length ? jobs : mockJobs });
  } catch (error) {
    console.error("Jobs API error:", error);
    return NextResponse.json({ results: mockJobs });
  }
}

const mockJobs = [
  { id: "1", title: "Frontend Developer", company: "Techify", location: "Remote", type: "Full-time", link: "#" },
  { id: "2", title: "Backend Engineer", company: "CodeLabs", location: "Hybrid - Lagos", type: "Full-time", link: "#" },
  { id: "3", title: "UI/UX Designer", company: "SoftWorks", location: "Remote", type: "Contract", link: "#" },
];
