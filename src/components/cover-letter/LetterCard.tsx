// src/app/dashboard/cover-letter/components/LetterCard.tsx
"use client";

import Link from "next/link";
import React from "react";

type CoverLetter = {
  id: string;
  company_name?: string;
  position?: string;
  content?: string;
  created_at?: string;
};

export default function LetterCard({ letter }: { letter: CoverLetter }) {
  const createdAt = letter.created_at ? new Date(letter.created_at) : null;

  return (
    <div className="glass p-4 rounded-2xl">
      <h3 className="text-lg font-semibold">{letter.position}</h3>
      <p className="text-sm text-gray-400">{letter.company_name}</p>
      <p className="text-xs text-gray-500 mt-2">
        {createdAt ? createdAt.toLocaleString() : "Saved draft"}
      </p>

      <div className="mt-4 flex justify-end gap-2">
        <Link href={`/dashboard/cover-letter/${letter.id}`}>
          <button className="btn">Open</button>
        </Link>
      </div>
    </div>
  );
}
