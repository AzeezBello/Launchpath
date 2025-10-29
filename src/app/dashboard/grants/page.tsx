"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Grant {
  id: string;
  title: string;
  organization: string;
  amount?: string;
  country: string;
  link: string;
}

export default function GrantsPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchGrants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/grants?query=${query}`);
      const data = await res.json();
      setGrants(data?.results || []);
    } catch (error) {
      console.error("Error fetching grants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold">💰 Grants</h2>
      <div className="flex gap-3 mb-6">
        <Input
          placeholder="Search by category, sector, or country..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={fetchGrants} disabled={loading}>
          {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Search"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin h-6 w-6" />
        </div>
      ) : grants.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grants.map((grant) => (
            <Card key={grant.id} className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle>{grant.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Organization:</strong> {grant.organization}</p>
                {grant.amount && <p><strong>Amount:</strong> {grant.amount}</p>}
                <p><strong>Country:</strong> {grant.country}</p>
                <a href={grant.link} target="_blank" className="text-primary mt-2 inline-block">
                  View details →
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No grants found.</p>
      )}
    </div>
  );
}
