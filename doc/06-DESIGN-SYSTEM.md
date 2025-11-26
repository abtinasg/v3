# Deep - Design System
## Version 1.0 | November 2025

---

## 1. Color Palette

### Primary Colors (Terminal Theme - Dark)
```css
:root {
  /* Background layers */
  --bg-primary: #0a0e17;      /* Main background */
  --bg-secondary: #111827;    /* Card backgrounds */
  --bg-tertiary: #1f2937;     /* Elevated surfaces */
  --bg-hover: #374151;        /* Hover states */

  /* Text colors */
  --text-primary: #f9fafb;    /* Main text */
  --text-secondary: #9ca3af;  /* Secondary text */
  --text-muted: #6b7280;      /* Muted/disabled */
  --text-inverse: #111827;    /* On light bg */

  /* Accent colors */
  --accent-primary: #3b82f6;  /* Primary blue */
  --accent-hover: #2563eb;    /* Blue hover */
  --accent-light: #60a5fa;    /* Light blue */

  /* Status colors */
  --positive: #22c55e;        /* Green - up/gains */
  --positive-bg: rgba(34, 197, 94, 0.1);
  --negative: #ef4444;        /* Red - down/losses */
  --negative-bg: rgba(239, 68, 68, 0.1);
  --warning: #f59e0b;         /* Amber - caution */
  --warning-bg: rgba(245, 158, 11, 0.1);

  /* Terminal-specific */
  --terminal-border: #1f2937;
  --terminal-divider: #374151;
  --terminal-glow: rgba(59, 130, 246, 0.1);
}
```

---

## 2. Typography

### Font Stack
```css
/* Primary font - Install via Google Fonts */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace (for numbers/data) */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

### Type Scale (Tailwind Classes)
```
Page Titles:      text-4xl (36px) font-bold
Section Headers:  text-2xl (24px) font-semibold
Card Titles:      text-lg (18px) font-semibold
Body Text:        text-base (16px) font-normal
Secondary Text:   text-sm (14px) font-normal
Labels/Captions:  text-xs (12px) font-medium
Data Large:       text-2xl (24px) font-mono font-semibold
Data Normal:      text-base (16px) font-mono
Data Small:       text-xs (12px) font-mono
```

---

## 3. Spacing System (Tailwind)

```
p-1:  4px    (tight)
p-2:  8px    (compact)
p-3:  12px   (default inner)
p-4:  16px   (standard)
p-6:  24px   (comfortable)
p-8:  32px   (spacious)

gap-2: 8px   (tight grid)
gap-4: 16px  (standard grid)
gap-6: 24px  (comfortable grid)
```

---

## 4. Component Specifications

### 4.1 Panel / Card
```tsx
// Base panel style
className="bg-[#111827] border border-[#1f2937] rounded-lg p-4"

// Panel with header
<div className="bg-[#111827] border border-[#1f2937] rounded-lg">
  <div className="px-4 py-3 border-b border-[#1f2937]">
    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
      Panel Title
    </h3>
  </div>
  <div className="p-4">
    {/* Content */}
  </div>
</div>
```

### 4.2 Data Tile (Interactive)
```tsx
// Clickable tile for indices/sectors/stocks
<div 
  className={cn(
    "flex items-center justify-between p-3 rounded-md cursor-pointer",
    "hover:bg-[#374151] transition-colors",
    isSelected && "bg-blue-500/10 border border-blue-500/30"
  )}
>
  <div>
    <p className="text-sm font-medium text-white">{name}</p>
    <p className="text-xs text-gray-400">{symbol}</p>
  </div>
  <div className="text-right">
    <p className="text-sm font-mono text-white">{price}</p>
    <p className={cn(
      "text-xs font-mono",
      change >= 0 ? "text-green-500" : "text-red-500"
    )}>
      {change >= 0 ? "+" : ""}{changePercent}%
    </p>
  </div>
</div>
```

### 4.3 Metric Display with Explain Button
```tsx
<div className="flex items-center justify-between py-2">
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-400">{label}</span>
    <button 
      onClick={onExplain}
      className="w-4 h-4 rounded-full bg-gray-700 hover:bg-blue-500 
                 text-xs text-gray-400 hover:text-white transition-colors"
    >
      ?
    </button>
  </div>
  <span className="text-sm font-mono text-white">{value}</span>
</div>
```

### 4.4 Price Change Badge
```tsx
<span className={cn(
  "inline-flex items-center px-2 py-0.5 rounded text-xs font-mono",
  change >= 0 
    ? "bg-green-500/10 text-green-500" 
    : "bg-red-500/10 text-red-500"
)}>
  {change >= 0 ? "▲" : "▼"} {Math.abs(changePercent)}%
</span>
```

### 4.5 Search Input
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
  <input
    type="text"
    placeholder="Search stocks, indices..."
    className="w-full bg-[#1f2937] border border-[#374151] rounded-lg 
               pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500
               focus:outline-none focus:border-blue-500"
  />
</div>
```

### 4.6 Button Variants
```tsx
// Primary Button
className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg 
           text-sm font-medium transition-colors"

// Secondary Button
className="bg-[#1f2937] hover:bg-[#374151] text-white px-4 py-2 rounded-lg 
           text-sm font-medium border border-[#374151] transition-colors"

// Ghost Button
className="hover:bg-[#1f2937] text-gray-400 hover:text-white px-3 py-2 
           rounded-lg text-sm transition-colors"

// Icon Button
className="w-8 h-8 flex items-center justify-center rounded-lg 
           hover:bg-[#1f2937] text-gray-400 hover:text-white transition-colors"
```

---

## 5. Layout Templates

### 5.1 Terminal Layout (Three Column)
```tsx
<div className="h-screen bg-[#0a0e17] flex flex-col">
  {/* Top Bar */}
  <header className="h-14 border-b border-[#1f2937] px-4 flex items-center">
    <Logo />
    <SearchBar className="flex-1 max-w-xl mx-8" />
    <UserMenu />
  </header>
  
  {/* Main Content */}
  <div className="flex-1 flex overflow-hidden">
    {/* Left Column - Market Data */}
    <aside className="w-72 border-r border-[#1f2937] overflow-y-auto p-4 space-y-4">
      <IndicesPanel />
      <SectorsPanel />
      <FixedIncomePanel />
    </aside>
    
    {/* Center Column - Charts & News */}
    <main className="flex-1 overflow-y-auto p-4 space-y-4">
      <PerformanceChart />
      <div className="grid grid-cols-2 gap-4">
        <NewsFeed />
        <FactorsPanel />
      </div>
    </main>
    
    {/* Right Column - Study List + AI */}
    <aside className={cn(
      "border-l border-[#1f2937] overflow-y-auto transition-all",
      isAIPanelOpen ? "w-96" : "w-80"
    )}>
      <StudyList />
      {isAIPanelOpen && <AIChatPanel />}
    </aside>
  </div>
</div>
```

### 5.2 Stock Dashboard Layout
```tsx
<div className="min-h-screen bg-[#0a0e17]">
  {/* Stock Header */}
  <div className="border-b border-[#1f2937] p-6">
    <StockHeader symbol={symbol} />
  </div>
  
  {/* Content Grid */}
  <div className="p-6 grid grid-cols-12 gap-6">
    {/* Chart - Full Width */}
    <div className="col-span-12">
      <StockChart />
    </div>
    
    {/* Metrics - Left Side */}
    <div className="col-span-8 space-y-6">
      <MetricsGrid category="valuation" />
      <MetricsGrid category="profitability" />
      <MetricsGrid category="growth" />
    </div>
    
    {/* Risk Panel - Right Side */}
    <div className="col-span-4">
      <RiskPanel />
    </div>
  </div>
</div>
```

---

## 6. Animation & Transitions

```css
/* Standard transition */
transition-colors duration-150

/* Panel slide */
transition-all duration-300 ease-in-out

/* Hover scale (for tiles) */
hover:scale-[1.02] transition-transform duration-150

/* Loading pulse */
animate-pulse bg-[#1f2937]
```

---

## 7. Responsive Breakpoints

```
sm:   640px   (Mobile landscape)
md:   768px   (Tablet)
lg:   1024px  (Small desktop)
xl:   1280px  (Desktop)
2xl:  1536px  (Large desktop)
```

### Terminal Responsive Behavior
```
xl+:    Three columns (280px | flex | 320px)
lg:     Two columns (collapse left into tabs)
md:     Single column (stack all panels)
sm:     Mobile optimized (simplified view)
```

---

## 8. Icon System

Use `lucide-react` for all icons:
```tsx
import { 
  Search,           // Search bar
  TrendingUp,       // Positive change
  TrendingDown,     // Negative change
  HelpCircle,       // Explain button
  MessageSquare,    // AI chat
  Plus,             // Add to list
  X,                // Remove/close
  ChevronRight,     // Navigation
  BarChart2,        // Charts
  Settings,         // Settings
  User,             // Profile
  Star,             // Favorites
  ExternalLink,     // External links
} from 'lucide-react';
```

---

## 9. Chart Styling

### Recharts Theme
```tsx
const chartTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    positive: '#22c55e',
    negative: '#ef4444',
    grid: '#1f2937',
    text: '#9ca3af',
  },
  axis: {
    stroke: '#374151',
    fontSize: 12,
    fontFamily: 'JetBrains Mono',
  },
  tooltip: {
    background: '#1f2937',
    border: '#374151',
    text: '#f9fafb',
  },
};
```

---

## 10. Shadcn/ui Components to Install

```bash
npx shadcn-ui@latest init

# Required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
```

### Shadcn Theme Overrides (globals.css)
```css
@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 6%;
    --card-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
    --radius: 0.5rem;
  }
}
```
