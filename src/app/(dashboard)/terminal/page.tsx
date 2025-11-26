export default function Page() {
  return (
    <div className="grid flex-1 text-white md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-[280px_1fr_320px]">
      <div className="hidden border-r border-[#1f2937] bg-[#0a0e17] p-4 xl:block">
        <div className="flex h-full items-center justify-center rounded-md bg-white/5 text-sm font-semibold">
          Market Data
        </div>
      </div>
      <div className="bg-[#0a0e17] p-4 lg:border-r lg:border-[#1f2937] xl:border-r">
        <div className="flex h-full items-center justify-center rounded-md bg-white/5 text-sm font-semibold">
          Charts &amp; News
        </div>
      </div>
      <div className="bg-[#0a0e17] p-4">
        <div className="flex h-full items-center justify-center rounded-md bg-white/5 text-sm font-semibold">
          Study List &amp; AI Panel
        </div>
      </div>
    </div>
  );
}
