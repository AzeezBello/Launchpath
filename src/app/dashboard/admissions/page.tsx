"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function AdmissionsPage() {
  const [country, setCountry] = useState("");
  const [field, setField] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admissions?country=${country}&field=${field}`);
      const json = await res.json();
      setData(json.results || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">🎓 Admissions Finder</h2>
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <Input
          placeholder="Country (e.g. Nigeria)"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <Input
          placeholder="Field (e.g. Engineering)"
          value={field}
          onChange={(e) => setField(e.target.value)}
        />
        <Button onClick={fetchData} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : "Search"}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((u) => (
          <Card key={u.id} className="hover:shadow-lg transition">
            <CardHeader>
              <h3 className="font-semibold">{u.name}</h3>
            </CardHeader>
            <CardContent>
              <p>{u.country}</p>
              <p className="text-sm text-muted-foreground">{u.field}</p>
              <a href={u.website} target="_blank" className="text-blue-500 hover:underline text-sm">
                Visit Website
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
