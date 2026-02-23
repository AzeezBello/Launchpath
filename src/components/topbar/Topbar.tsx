"use client";

import { UserDropdown } from "@/components/user/UserDropdown";

export function Topbar() {
  return (
    <header className="glass flex justify-between items-center px-6 py-3 mb-4 sticky top-0 z-50 backdrop-blur-lg border-b border-white/10">
      <h1 className="text-lg font-semibold tracking-tight text-white/90">
        LaunchPath Dashboard
      </h1>
      <UserDropdown />
    </header>
  );
}
