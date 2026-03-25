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
import { ChevronDown, LogOut, Settings } from "lucide-react";

export function UserDropdown() {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const initials = user?.email?.[0]?.toUpperCase() || "U";
  const email = user?.email || "Workspace user";

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed");
    } else {
      toast.success("Logged out successfully");
      router.replace("/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-3 rounded-full border border-border/80 bg-card/75 px-2.5 py-2 shadow-sm hover:bg-accent/70">
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
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
