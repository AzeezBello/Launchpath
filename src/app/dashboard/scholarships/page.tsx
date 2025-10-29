"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  country: string;
  deadline?: string;
  link: string;
}

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/scholarships?query=${search}`);
      const data = await res.json();
      setScholarships(data?.results || []);
    } catch (error) {
      console.error("Error fetching scholarships:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold">🎓 Scholarships</h2>
      <div className="flex gap-3 mb-6">
        <Input
          placeholder="Search by keyword, course, or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={fetchScholarships} disabled={loading}>
          {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Search"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin h-6 w-6" />
        </div>
      ) : scholarships.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scholarships.map((sch) => (
            <Card key={sch.id} className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle>{sch.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Provider:</strong> {sch.provider}</p>
                <p><strong>Country:</strong> {sch.country}</p>
                {sch.deadline && <p><strong>Deadline:</strong> {sch.deadline}</p>}
                <a href={sch.link} target="_blank" className="text-primary mt-2 inline-block">
                  Learn more →
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No scholarships found.</p>
      )}
    </div>
  );
}
