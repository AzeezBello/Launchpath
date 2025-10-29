import { DashboardSidebar } from "@/components/sidebar/DashboardSidebar";
import { Topbar } from "@/components/topbar/Topbar";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { Footer } from "@/components/layout/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen text-white bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Sidebar */}
      <div className="hidden md:flex">
        <DashboardSidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-auto backdrop-blur-lg">
        <Topbar />
        <div className="flex-1 p-6 md:p-8 space-y-6">
          <DashboardClient>{children}</DashboardClient>
        </div>
        <Footer />
      </main>

      {/* Decorative glow effects */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl -z-10" />
    </div>
  );
}
