import { ArrowDownRight, ArrowUpRight, Bot, Cpu, Send, ShieldCheck, Sparkles } from "lucide-react";

const indices = [
  { name: "S&P 500", value: "5,432", change: "+0.82%", positive: true, selected: true },
  { name: "NASDAQ 100", value: "18,902", change: "+1.12%", positive: true },
  { name: "Russell 2K", value: "2,065", change: "-0.34%", positive: false },
  { name: "VIX", value: "12.04", change: "-4.21%", positive: false },
];

const sectors = [
  { name: "Tech", weight: 72, change: 1.2 },
  { name: "Energy", weight: 58, change: -0.6 },
  { name: "Financials", weight: 64, change: 0.4 },
  { name: "Healthcare", weight: 43, change: 0.9 },
];

const news = [
  { title: "Fed minutes hint at dovish bias as core PCE cools", sentiment: "positive", time: "12m ago" },
  { title: "Crude retreats as OPEC supply ramps; attention on EIA build", sentiment: "negative", time: "32m ago" },
  { title: "AI infra spend accelerates; semi capex guides raised", sentiment: "positive", time: "58m ago" },
  { title: "High yield spreads tighten to cycle lows; issuance reopens", sentiment: "neutral", time: "1h ago" },
];

const studies = [
  { name: "Liquidity Regime", score: 86, status: "Bullish bias", accent: "blue" },
  { name: "Momentum Factor", score: 72, status: "Rally continuation", accent: "emerald" },
  { name: "Credit Pulse", score: 48, status: "Cautious", accent: "yellow" },
  { name: "Tail Risk", score: 28, status: "Contained", accent: "rose" },
];

const aiMessages = [
  {
    from: "AI Desk",
    type: "ai",
    text: "I detect a bullish liquidity impulse while retail leverage cools. Consider a staggered entry on QQQ 2-week calls with 1.2 delta-weighted sizing.",
    time: "09:24",
  },
  {
    from: "You",
    type: "user",
    text: "Build me a momentum + vol compression scan for EU tech midcaps.",
    time: "09:26",
  },
  {
    from: "AI Desk",
    type: "ai",
    text: "Scanning for names with 20d HV < 15% and 10d RS > 70th percentile. ASML, SAP, and STM fit with supportive ETF flows.",
    time: "09:27",
  },
];

const cardClass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent p-5 backdrop-blur-sm shadow-[0_20px_60px_-35px_rgba(0,0,0,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/20";

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04080f] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-[-120px] h-64 w-64 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:40px_40px]" />
        <div className="absolute inset-0 opacity-[0.04] mix-blend-soft-light" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%25%27 height=%27100%25%27%3E%3Cfilter id=%27n%27 x=%270%27 y=%270%27 width=%27100%25%27 height=%27100%25%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%270.4%27/%3E%3C/svg%3E')" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-6 lg:px-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/30 text-lg font-bold text-white shadow-[0_10px_40px_-18px_rgba(59,130,246,0.8)]">
            DB
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-400">Macro Intelligence</p>
            <h1 className="bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-2xl font-bold text-transparent">
              Live Terminal
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1.5fr_360px]">
          <div className="space-y-6">
            <div className={`${cardClass} animate-fade-up`} style={{ animationDelay: "0.1s" }}>
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Market Indices</p>
                  <p className="bg-gradient-to-r from-white via-white/70 to-white/40 bg-clip-text text-lg font-semibold text-transparent">
                    Live board
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                  Liquidity +14bps
                </span>
              </div>

              <div className="space-y-3">
                {indices.map((item) => (
                  <div
                    key={item.name}
                    className={`group flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-300 ${
                      item.selected
                        ? "bg-blue-500/10 border-blue-500/30 shadow-[0_10px_35px_-20px_rgba(59,130,246,0.8)]"
                        : "border-transparent hover:border-white/10 hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-300">{item.name}</span>
                      {item.selected && (
                        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-200">Live</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 font-mono text-sm font-semibold">
                      <span className="text-white">{item.value}</span>
                      <span
                        className={`${
                          item.positive ? "text-emerald-400" : "text-rose-400"
                        } flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[11px]`}
                      >
                        {item.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {item.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Sector Pulse</p>
                {sectors.map((sector) => (
                  <div key={sector.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span className="font-semibold uppercase tracking-wide">{sector.name}</span>
                      <span className={`${sector.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {sector.change >= 0 ? "+" : ""}
                        {sector.change}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`${
                          sector.change >= 0 ? "from-emerald-400/80 to-blue-400/70" : "from-rose-400/80 to-orange-400/70"
                        } h-full w-full bg-gradient-to-r`}
                        style={{ width: `${sector.weight}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`${cardClass} animate-fade-up`} style={{ animationDelay: "0.2s" }}>
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-sm font-semibold text-white">Global Macro Radar</span>
                  <kbd className="rounded border border-white/10 bg-black/30 px-1.5 text-[10px] font-semibold text-gray-300">LIVE</kbd>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
                  <Sparkles className="h-3.5 w-3.5 text-blue-200" />
                  Adaptive Regime Model
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0f18]/60 px-4 py-5">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5" />
                <div className="absolute -left-10 top-2 h-20 w-20 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute right-5 top-5 h-16 w-16 rounded-full bg-purple-500/10 blur-3xl" />
                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="rounded-full bg-white/5 px-2 py-1 font-semibold uppercase tracking-wide text-emerald-200">Bullish Bias</span>
                  <span className="rounded-full bg-white/5 px-2 py-1 font-semibold uppercase tracking-wide text-blue-200">Liquidity Drive</span>
                  <span className="rounded-full bg-white/5 px-2 py-1 font-semibold uppercase tracking-wide text-purple-200">AI Assist</span>
                </div>

                <div className="h-64">
                  <svg viewBox="0 0 600 240" className="h-full w-full">
                    <defs>
                      <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(59,130,246,0.5)" />
                        <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                      </linearGradient>
                      <linearGradient id="stroke" x1="0%" x2="100%" y1="0" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="60%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,160 C100,140 120,120 200,130 C280,140 300,100 360,110 C420,120 440,150 520,130 C560,120 600,140 640,120"
                      fill="url(#fill)"
                      stroke="none"
                      className="transition-all duration-700"
                    />
                    <path
                      d="M0,160 C100,140 120,120 200,130 C280,140 300,100 360,110 C420,120 440,150 520,130 C560,120 600,140 640,120"
                      fill="none"
                      stroke="url(#stroke)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      style={{ filter: "drop-shadow(0 0 10px rgba(59,130,246,0.6))" }}
                    />
                  </svg>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Signal</p>
                    <p className="bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-lg font-bold text-transparent">
                      Liquidity Risk-On
                    </p>
                    <p className="text-[12px] text-gray-400">Futures skew positive, credit spreads tighten</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Action</p>
                    <p className="bg-gradient-to-r from-emerald-300 via-blue-200 to-white/60 bg-clip-text text-lg font-bold text-transparent">
                      Deploy 30% risk
                    </p>
                    <p className="text-[12px] text-gray-400">Fade gaps; scale into strength with stops</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${cardClass} animate-fade-up`} style={{ animationDelay: "0.25s" }}>
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">News Stream</p>
                  <p className="bg-gradient-to-r from-white via-white/70 to-white/40 bg-clip-text text-lg font-semibold text-transparent">
                    Narrative pressure
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  Smart filtration
                </div>
              </div>
              <div className="space-y-3">
                {news.map((item, idx) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04]"
                    style={{ animationDelay: `${0.1 * idx}s` }}
                  >
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${
                        item.sentiment === "positive"
                          ? "bg-emerald-400"
                          : item.sentiment === "negative"
                            ? "bg-rose-400"
                            : "bg-blue-300"
                      } animate-pulse shadow-[0_0_0_6px_rgba(255,255,255,0.05)]`}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold leading-tight text-white">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                    <button className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-blue-500/30">
                      Save
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`${cardClass} animate-fade-up`} style={{ animationDelay: "0.3s" }}>
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Studies</p>
                  <p className="bg-gradient-to-r from-white via-white/70 to-white/40 bg-clip-text text-lg font-semibold text-transparent">
                    Signal stack
                  </p>
                </div>
                <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-gray-300">⌘B</kbd>
              </div>
              <div className="space-y-3">
                {studies.map((study) => (
                  <div key={study.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">{study.name}</p>
                      <p className="text-xs text-gray-400">{study.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          study.accent === "blue"
                            ? "bg-blue-500/20 text-blue-200"
                            : study.accent === "emerald"
                              ? "bg-emerald-500/20 text-emerald-200"
                              : study.accent === "yellow"
                                ? "bg-amber-500/20 text-amber-200"
                                : "bg-rose-500/20 text-rose-200"
                        }`}
                      >
                        {study.score}
                      </span>
                      <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-blue-500/30">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${cardClass} animate-fade-up`} style={{ animationDelay: "0.35s" }}>
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">AI Desk</p>
                  <p className="bg-gradient-to-r from-white via-white/70 to-white/40 bg-clip-text text-lg font-semibold text-transparent">
                    Copilot chat
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
                  <Cpu className="h-4 w-4 text-purple-300" />
                  Auto-reasoning
                </div>
              </div>

              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white shadow-lg shadow-purple-500/30">
                  <Bot className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Atlas AI</p>
                  <p className="text-xs text-gray-400">Markets, flow, and portfolio copilot</p>
                </div>
                <div className="ml-auto flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-blue-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Real-time
                </div>
              </div>

              <div className="space-y-3">
                {aiMessages.map((msg, idx) => (
                  <div
                    key={`${msg.from}-${idx}`}
                    className={`flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 ${
                      msg.type === "ai" ? "rounded-tl-sm" : "rounded-tr-sm"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-inner ${
                        msg.type === "ai"
                          ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                          : "bg-white/10 text-gray-200"
                      }`}
                    >
                      {msg.type === "ai" ? "AI" : "YOU"}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-relaxed text-gray-100">{msg.text}</p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{msg.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {["Flow scan", "Risk budget", "Options spread", "Explain regime"].map((chip) => (
                  <button
                    key={chip}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-blue-500/30"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
                <input
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none"
                  placeholder="Ask anything: regime shifts, trade setups, risk..."
                />
                <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5">
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.6), rgba(139, 92, 246, 0.5));
          border-radius: 999px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.7));
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          opacity: 0;
          animation: fadeUp 0.7s ease forwards;
        }
      `}</style>
    </div>
  );
}
