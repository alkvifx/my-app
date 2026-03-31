"use client";

import { Button } from "@/components/ui/button";

export function PrintReportButton() {
  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-9"
      onClick={handlePrint}
    >
      Print Report
    </Button>
  );
}

