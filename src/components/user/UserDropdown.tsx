"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupabase } from "@/providers/SupabaseProvider";
import { ChevronDown, Compass, LogOut, Settings } from "lucide-react";
import { START_TOUR_EVENT } from "@/components/tour/ProductTour";

export function UserDropdown() {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const initials = user?.email?.[0]?.toUpperCase() || "U";
  const email = user?.email || "Workspace user";

  const handleLogout = async () => {
    // Hits the server so the httpOnly settings cookie gets cleared too — the
    // client-only signOut() below can't reach an httpOnly cookie by itself.
    const res = await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    const { error } = await supabase.auth.signOut();

    if (error || !res?.ok) {
      toast.error("Logout failed");
    } else {
      toast.success("Logged out successfully");
      router.replace("/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-tour="user-menu"
          className="inline-flex items-center gap-3 rounded-full border border-border/80 bg-card/75 px-2.5 py-2 shadow-sm hover:bg-accent/70"
        >
          <Avatar className="size-9 cursor-pointer ring-1 ring-border">
            <AvatarImage src="" alt="User avatar" />
            <AvatarFallback className="bg-primary/15 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="hidden text-left sm:block">
            <p className="max-w-[180px] truncate text-sm font-semibold">{email}</p>
            <p className="text-xs text-muted-foreground">Workspace account</p>
          </div>

          <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <DropdownMenuLabel className="space-y-1">
          <p className="text-sm font-semibold">{email}</p>
          <p className="text-xs font-normal text-muted-foreground">
            Signed in to LaunchPath
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent(START_TOUR_EVENT))}>
          <Compass className="mr-2 h-4 w-4" />
          Take a tour
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
