type StockPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function StockPage({ params }: StockPageProps) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <StockHeader symbol={upperSymbol} />

      <div className="p-6 space-y-6">
        <StockChart symbol={upperSymbol} />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <MetricsGrid symbol={upperSymbol} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <RiskPanel symbol={upperSymbol} />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PLACEHOLDER COMPONENTS
// Replace with real implementations once ready
// =============================================================================

type SectionProps = {
  symbol: string;
};

function StockHeader({ symbol }: SectionProps) {
  return (
    <header className="w-full border-b border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm uppercase text-white/60">Stock Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight">{symbol}</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-white/60">Last updated just now</p>
          <p className="text-lg font-medium">Realtime data coming soon</p>
        </div>
      </div>
    </header>
  );
}

function StockChart({ symbol }: SectionProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Price Action</h2>
          <p className="text-sm text-white/60">Interactive chart for {symbol}</p>
        </div>
        <div className="flex gap-2">
          {['1D', '1W', '1M', '3M', '1Y', '5Y'].map((range) => (
            <button
              key={range}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80"
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-white/10 bg-[#0f1422]">
        <p className="text-white/50">Chart component placeholder</p>
      </div>
    </section>
  );
}

function MetricsGrid({ symbol }: SectionProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Fundamental Metrics</h2>
        <p className="text-sm text-white/60">Key stats and ratios for {symbol}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-white/10 bg-[#0f1422] p-4"
          >
            <p className="text-xs uppercase tracking-wide text-white/50">Metric {index + 1}</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
            <p className="text-xs text-white/40">Value coming soon</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskPanel({ symbol }: SectionProps) {
  return (
    <aside className="rounded-xl border border-white/10 bg-gradient-to-b from-[#141a2b] to-[#0a0e17] p-6">
      <h2 className="text-xl font-semibold">Risk Overview</h2>
      <p className="text-sm text-white/60">Risk analytics for {symbol}</p>

      <div className="mt-6 space-y-4">
        {['Overall Risk', 'Market Volatility', 'Liquidity', 'Fundamental'].map((label) => (
          <div key={label} className="rounded-lg border border-white/10 bg-[#0f1422] p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
            <p className="text-xs text-white/40">Analysis coming soon</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
