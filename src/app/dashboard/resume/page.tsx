"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Resume {
  id: string;
  title: string;
  created_at: string;
}

export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setResumes(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          📄 My Resumes
        </h1>
        <Link href="/dashboard/resume/new">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">Create New Resume</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-emerald-400 h-6 w-6" />
        </div>
      ) : resumes.length === 0 ? (
        <p className="text-center text-gray-400">No resumes yet. Create one to get started!</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <Card
              key={resume.id}
              className="bg-white/10 backdrop-blur-lg border border-white/20 hover:shadow-lg hover:shadow-emerald-400/10 transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-emerald-400" /> {resume.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <Link href={`/dashboard/resume/${resume.id}`}>
                  <Button variant="secondary">Edit</Button>
                </Link>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await supabase.from("resumes").delete().eq("id", resume.id);
                    fetchResumes();
                  }}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
