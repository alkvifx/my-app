import { Bell, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNavbar() {
  return (
    <header className="h-14 border-b border-border bg-background/60 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span className="font-semibold">School Management System</span>
        </div>

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

