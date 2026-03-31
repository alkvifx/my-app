"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { FileText, LayoutDashboard, School2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/classes", label: "Classes", icon: School2 },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-full border-b border-border bg-card/60 md:w-64 md:border-b-0 md:border-r",
      )}
    >
      <div className="px-4 py-3">
        <div className="text-sm font-semibold">School Management</div>
      </div>

      <nav
        className={cn(
          "flex items-center gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:gap-2 md:px-3 md:pb-3",
        )}
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className="h-10 w-full justify-start gap-2 md:w-full"
            >
              <Link href={item.href} className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}

