"use client";

import { useState } from "react";
import {
  Bell,
  Command as CommandIcon,
  Flame,
  Search,
  Sparkles,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";

const shortcuts = ["⌘K", "⇧P", "⌘/", "G G"];

export function TerminalHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#0c111b]/80 via-[#080c14]/90 to-[#050811] px-5 py-4 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-10 -top-16 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-0 top-10 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="relative flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-transparent text-lg font-bold text-white shadow-[0_10px_40px_-18px_rgba(59,130,246,0.8)]">
            <span className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">DEEP</span>
            <div className="absolute -bottom-1 h-px w-full bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Terminal
            </p>
            <p className="bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-sm font-semibold text-transparent">
              AI-Powered Macro Desk
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left shadow-[0_20px_60px_-28px_rgba(59,130,246,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:shadow-blue-500/20"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 opacity-0 transition duration-300 group-hover:opacity-100" />
            <Command className="cursor-pointer border-none bg-transparent text-white shadow-none">
              <div className="flex h-11 items-center gap-3 px-4 text-sm text-[#c3c7d1]">
                <Search className="h-4 w-4 text-blue-300" />
                <span className="flex-1">Search tickers, macros, AI playbooks</span>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  <CommandIcon className="h-4 w-4" />
                  <span>+ K</span>
                </div>
              </div>
            </Command>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-200 shadow-inner shadow-blue-500/10 lg:flex">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span>Volatility: Elevated</span>
          </div>
          <button className="relative flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/10 px-3 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/30">
            <Sparkles className="h-4 w-4 text-blue-200" />
            Upgrade
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 text-[10px] font-semibold text-gray-300">⌘U</kbd>
            <div className="absolute -bottom-px left-3 right-3 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
          </button>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(34,197,94,0.2)]" />
          </button>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
            {shortcuts.map((s) => (
              <kbd
                key={s}
                className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 text-[10px] font-semibold text-gray-200 shadow-inner"
              >
                {s}
              </kbd>
            ))}
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 rounded-2xl border border-white/10 shadow-lg shadow-blue-500/20",
              },
            }}
          />
        </div>
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
