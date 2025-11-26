"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";

export function TerminalHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 items-center border-b border-[#1f2937] bg-[#111827] px-4">
      <div className="flex w-24 justify-start">
        <span className="text-lg font-bold text-[#3b82f6]">DEEP</span>
      </div>

      <div className="flex flex-1 justify-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full max-w-xl text-left"
        >
          <Command className="cursor-pointer border border-[#1f2937] bg-[#0f172a] text-white shadow-none">
            <div className="flex h-10 items-center gap-2 px-3 text-sm text-[#9ca3af]">
              <Search className="h-4 w-4" />
              <span>Search stocks, indices... (⌘K)</span>
            </div>
          </Command>
        </button>
      </div>

      <div className="flex w-24 justify-end">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search stocks, indices... (⌘K)" autoFocus />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
        </CommandList>
      </CommandDialog>
    </header>
  );
}

export default TerminalHeader;
