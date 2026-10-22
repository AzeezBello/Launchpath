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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/providers/SupabaseProvider";
import { ChevronDown, Compass, LogOut, Settings, ShieldCheck } from "lucide-react";
import { START_TOUR_EVENT } from "@/components/tour/ProductTour";

export function UserDropdown() {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const initials = user?.email?.[0]?.toUpperCase() || "U";
  const email = user?.email || "Workspace user";
  const isSuperadmin =
    user?.role === "superadmin" ||
    user?.app_metadata?.role === "superadmin" ||
    user?.app_metadata?.is_superadmin === true;

  const handleLogout = async () => {
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
        <Button
          variant="outline"
          data-tour="user-menu"
          className="h-10 gap-2.5 rounded-xl border-border/80 bg-card/75 px-2.5 py-1.5 font-normal shadow-2xs hover:bg-accent/65"
        >
          <Avatar className="size-7 ring-1 ring-border">
            <AvatarImage src="" alt="User avatar" />
            <AvatarFallback className="bg-primary/15 font-mono text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="hidden text-left sm:block">
            <div className="flex items-center gap-1.5">
              <p className="max-w-[148px] truncate text-xs font-semibold text-foreground leading-tight">
                {email}
              </p>
              {isSuperadmin && (
                <Badge variant="default" className="h-4 gap-1 px-1.5 text-[9px]">
                  <ShieldCheck className="size-2.5" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {isSuperadmin ? "Superadmin" : "Workspace"}
            </p>
          </div>

          <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[240px]">
        <DropdownMenuLabel className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{email}</p>
            {isSuperadmin && (
              <Badge variant="default" className="h-5 px-2 text-[10px]">
                Superadmin
              </Badge>
            )}
          </div>
          <p className="font-mono text-[11px] font-normal text-muted-foreground">
            Neon Serverless · Synced
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
          <Settings className="mr-2 size-4 text-muted-foreground" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent(START_TOUR_EVENT))}>
          <Compass className="mr-2 size-4 text-muted-foreground" />
          Take workspace tour
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
