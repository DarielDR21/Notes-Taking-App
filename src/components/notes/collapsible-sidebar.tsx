"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { BookOpenText, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CollapsibleSidebar({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`relative flex min-h-[calc(100vh-2rem)] flex-col rounded-lg border bg-card transition-[width] duration-200 ${
        open ? "w-full lg:w-[22rem]" : "w-16"
      }`}
    >
      <Button
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        className="absolute right-3 top-3 z-10"
        onClick={() => setOpen((current) => !current)}
        size="icon"
        type="button"
        variant="ghost"
      >
        {open ? (
          <PanelLeftClose className="size-4" />
        ) : (
          <PanelLeftOpen className="size-4" />
        )}
      </Button>
      {open ? (
        children
      ) : (
        <div className="flex flex-1 flex-col items-center gap-4 p-3 pt-14">
          <BookOpenText className="size-5 text-primary" />
        </div>
      )}
    </aside>
  );
}
