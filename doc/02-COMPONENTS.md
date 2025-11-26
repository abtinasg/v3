# Deep - Component Specifications
## Version 1.0 | November 2025

---

## 1. Deep Terminal Components

### 1.1 Terminal Layout (`/components/terminal/TerminalLayout.tsx`)
```typescript
interface TerminalLayoutProps {
  children: React.ReactNode;
  showAIPanel: boolean;
  onToggleAIPanel: () => void;
}
```
**Behavior:**
- Three-column grid layout (responsive)
- Left: Market panels (30%)
- Center: Charts & news (40%)
- Right: Study list + AI panel (30%)
- AI panel slides in/out from right

---

### 1.2 Market Indices Panel (`/components/terminal/IndicesPanel.tsx`)
```typescript
interface Index {
  symbol: string;      // "SPY", "DIA", "QQQ"
  name: string;        // "S&P 500", "Dow Jones", "Nasdaq"
  price: number;
  change: number;
  changePercent: number;
  isSelected: boolean;
}

interface IndicesPanelProps {
  indices: Index[];
  onSelect: (symbol: string) => void;
  onExplain: (symbol: string) => void;
}
```
**Behavior:**
- Shows major US indices with real-time prices
- Single click: select for comparison
- Double click: trigger AI explanation
- Green/red color coding for up/down

---

### 1.3 Sectors Panel (`/components/terminal/SectorsPanel.tsx`)
```typescript
interface Sector {
  id: string;          // "XLK", "XLV", "XLF"
  name: string;        // "Technology", "Healthcare", "Financials"
  changePercent: number;
  isSelected: boolean;
}

interface SectorsPanelProps {
  sectors: Sector[];
  onSelect: (id: string) => void;
  onExplain: (id: string) => void;
}
```
**Behavior:**
- Horizontal bar chart showing sector performance
- Click to select, double-click for AI

---

### 1.4 Performance Chart (`/components/terminal/PerformanceChart.tsx`)
```typescript
interface ChartData {
  date: string;
  [symbol: string]: number | string;
}

interface PerformanceChartProps {
  data: ChartData[];
  symbols: string[];
  timeRange: '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';
  onTimeRangeChange: (range: string) => void;
}
```
**Behavior:**
- Normalized performance comparison
- Multiple lines for selected symbols
- Time range selector
- Tooltip with exact values

---

### 1.5 News Feed (`/components/terminal/NewsFeed.tsx`)
```typescript
interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: Date;
  url: string;
  symbols?: string[];
}

interface NewsFeedProps {
  items: NewsItem[];
  maxItems?: number;
  onItemClick: (item: NewsItem) => void;
}
```
**Behavior:**
- Scrollable list of headlines
- Click opens external link
- Filter by selected symbols

---

### 1.6 Study List (`/components/terminal/StudyList.tsx`)
```typescript
interface StudyListItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StudyListProps {
  items: StudyListItem[];
  onSelect: (symbol: string) => void;
  onRemove: (symbol: string) => void;
  onNavigate: (symbol: string) => void;
  maxItems: number;  // 3 for free, unlimited for pro
}
```
**Behavior:**
- User's saved stocks for learning
- Click to view details
- Navigate to Stock Dashboard
- Remove button (X)

---

### 1.7 AI Chat Panel (`/components/ai/AIChatPanel.tsx`)
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    type: 'stock' | 'index' | 'sector' | 'macro';
    symbol?: string;
    name?: string;
  };
}

interface AIChatPanelProps {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  selectedContext: string[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
  questionsRemaining?: number;  // for free tier
}
```
**Behavior:**
- Docked right panel (collapsible)
- Shows selected context as chips
- Streaming responses
- Question counter for free tier

---

## 2. Stock Dashboard Components

### 2.1 Stock Header (`/components/stock/StockHeader.tsx`)
```typescript
interface StockHeaderProps {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  onAddToStudyList: () => void;
  isInStudyList: boolean;
}
```

---

### 2.2 Metrics Grid (`/components/stock/MetricsGrid.tsx`)
```typescript
interface Metric {
  id: string;
  label: string;
  value: number | string;
  category: 'valuation' | 'profitability' | 'growth' | 'leverage' | 'efficiency';
  tooltip: string;
  format: 'number' | 'percent' | 'currency' | 'ratio';
}

interface MetricsGridProps {
  metrics: Metric[];
  onExplain: (metricId: string) => void;
}
```
**Behavior:**
- Grid layout grouped by category
- Each metric has [?] button for AI explanation
- Collapsible sections

---

### 2.3 Risk Panel (`/components/stock/RiskPanel.tsx`)
```typescript
interface RiskMetric {
  id: string;
  label: string;
  value: number;
  level: 'low' | 'medium' | 'high';
  category: 'market' | 'fundamental' | 'liquidity' | 'behavioral';
}

interface RiskPanelProps {
  metrics: RiskMetric[];
  overallRiskScore: number;
  onExplain: (metricId: string) => void;
}
```

---

### 2.4 Stock Chart (`/components/stock/StockChart.tsx`)
```typescript
interface StockChartProps {
  symbol: string;
  data: OHLCV[];
  chartType: 'line' | 'candlestick';
  timeRange: string;
  indicators?: string[];
  onPointClick?: (point: OHLCV) => void;
}
```

---

## 3. Deep Score Components

### 3.1 Quiz Container (`/components/score/QuizContainer.tsx`)
```typescript
interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'scale';
  options: {
    id: string;
    text: string;
    value: number;
  }[];
  category: 'knowledge' | 'behavior' | 'risk';
}

interface QuizContainerProps {
  questions: Question[];
  currentIndex: number;
  onAnswer: (questionId: string, answer: string | string[]) => void;
  onComplete: () => void;
}
```

---

### 3.2 Score Result (`/components/score/ScoreResult.tsx`)
```typescript
interface ScoreResultProps {
  score: number;
  personalityType: PersonalityType;
  breakdown: {
    knowledge: number;
    behavior: number;
    risk: number;
  };
  onShare: () => void;
  onContinue: () => void;
}

type PersonalityType = 
  | 'cautious-saver'
  | 'steady-builder'
  | 'growth-hunter'
  | 'strategic-analyst'
  | 'trend-surfer';
```

---

## 4. Shared Components

### 4.1 Explainable Metric (`/components/shared/ExplainableMetric.tsx`)
```typescript
interface ExplainableMetricProps {
  label: string;
  value: string | number;
  format?: 'number' | 'percent' | 'currency';
  onExplain: () => void;
  size?: 'sm' | 'md' | 'lg';
}
```
**Behavior:**
- Displays metric with [?] button
- Click triggers AI explanation
- Consistent styling across app

---

### 4.2 Symbol Search (`/components/shared/SymbolSearch.tsx`)
```typescript
interface SymbolSearchProps {
  onSelect: (symbol: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}
```
**Behavior:**
- Debounced search
- Shows matching symbols with names
- Keyboard navigation

---

### 4.3 Time Range Selector (`/components/shared/TimeRangeSelector.tsx`)
```typescript
interface TimeRangeSelectorProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}
```

---

### 4.4 Loading States (`/components/shared/Loading.tsx`)
```typescript
// Skeleton loaders for each component type
export const SkeletonMetric: React.FC;
export const SkeletonChart: React.FC;
export const SkeletonPanel: React.FC;
export const SkeletonCard: React.FC;
```

---

## 5. State Management (Zustand Stores)

### 5.1 Terminal Store (`/stores/terminalStore.ts`)
```typescript
interface TerminalState {
  // Selection state
  selectedIndices: string[];
  selectedSectors: string[];
  selectedStock: string | null;
  
  // UI state
  isAIPanelOpen: boolean;
  timeRange: string;
  
  // Actions
  toggleIndex: (symbol: string) => void;
  toggleSector: (id: string) => void;
  selectStock: (symbol: string) => void;
  setTimeRange: (range: string) => void;
  toggleAIPanel: () => void;
  clearSelection: () => void;
}
```

---

### 5.2 AI Store (`/stores/aiStore.ts`)
```typescript
interface AIState {
  // Conversations
  conversations: Map<string, Message[]>;
  activeConversationId: string | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Usage tracking (free tier)
  dailyQuestionsUsed: number;
  dailyLimit: number;
  
  // Actions
  sendMessage: (message: string, context?: AIContext) => Promise<void>;
  startNewConversation: (type: string, symbol?: string) => void;
  clearConversation: (id: string) => void;
}
```

---

### 5.3 User Store (`/stores/userStore.ts`)
```typescript
interface UserState {
  profile: UserProfile | null;
  studyList: StudyListItem[];
  subscription: 'free' | 'pro';
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateScore: (score: number, personality: string) => Promise<void>;
  addToStudyList: (symbol: string) => Promise<void>;
  removeFromStudyList: (symbol: string) => Promise<void>;
}
```

---

## 6. Custom Hooks

### 6.1 Market Data Hooks
```typescript
// Real-time quote data
function useQuote(symbol: string): {
  data: Quote | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Historical chart data
function useChartData(symbol: string, range: string): {
  data: OHLCV[];
  isLoading: boolean;
  error: Error | null;
}

// Market indices
function useIndices(): {
  data: Index[];
  isLoading: boolean;
  refetch: () => void;
}

// Sector performance
function useSectors(): {
  data: Sector[];
  isLoading: boolean;
  refetch: () => void;
}
```

---

### 6.2 Stock Data Hooks
```typescript
// Fundamental metrics
function useFundamentals(symbol: string): {
  data: FundamentalMetrics | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Risk metrics
function useRiskMetrics(symbol: string): {
  data: RiskMetrics | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Company profile
function useCompanyProfile(symbol: string): {
  data: CompanyProfile | undefined;
  isLoading: boolean;
}
```

---

### 6.3 AI Hooks
```typescript
// AI explanation
function useExplain(): {
  explain: (type: string, id: string) => Promise<string>;
  isLoading: boolean;
  response: string | null;
}

// AI chat
function useAIChat(conversationId: string): {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  canAsk: boolean;  // based on tier limits
}
```
