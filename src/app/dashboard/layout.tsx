import { DashboardSidebar } from "@/components/sidebar/DashboardSidebar";
import { Topbar } from "@/components/topbar/Topbar";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),transparent_22%)]" />

      <div className="relative flex min-h-screen">
        <DashboardSidebar />

        <main className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <div className="flex-1 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <DashboardClient>{children}</DashboardClient>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
