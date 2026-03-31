import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNavbar } from "@/components/dashboard/TopNavbar";
import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <TopNavbar />

      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

