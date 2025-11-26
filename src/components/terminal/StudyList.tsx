import { cn } from "@/lib/utils";

export interface StudyListItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface StudyListProps {
  items: StudyListItem[];
  onSelect: (symbol: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  canAdd: boolean;
  limit: number;
  isLoading?: boolean;
}

export const MOCK_STUDY_LIST: StudyListItem[] = [
  { id: "1", symbol: "AAPL", name: "Apple Inc.", price: 178.5, change: 2.3, changePercent: 1.3 },
  { id: "2", symbol: "MSFT", name: "Microsoft", price: 378.2, change: -1.5, changePercent: -0.4 },
];

export function StudyList({
  items,
  onSelect,
  onRemove,
  onAdd,
  canAdd,
  limit,
  isLoading = false,
}: StudyListProps) {
  const hasItems = items.length > 0;
  const itemCountLabel = `${items.length}/${limit}`;

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-xl bg-[#0f172a] p-4">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-400">
          <span>My Study List</span>
          <span className="rounded-md bg-[#1f2937] px-2 py-1 text-[11px] text-gray-300">{itemCountLabel}</span>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`study-list-loading-${index}`} className="h-14 animate-pulse rounded-md bg-[#1f2937]" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-xl bg-[#0f172a] p-6 text-center text-gray-300">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1f2937] text-xl text-gray-200">+
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold text-white">Add stocks to your study list</div>
          <div className="text-xs text-gray-400">Save tickers you want to research later.</div>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={!canAdd}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white transition",
            canAdd
              ? "bg-blue-600 hover:bg-blue-500"
              : "cursor-not-allowed bg-[#1f2937] text-gray-500"
          )}
        >
          <span className="text-lg leading-none">+</span>
          <span>Add</span>
          <span className="rounded bg-black/30 px-2 py-0.5 text-[11px] font-medium">{itemCountLabel}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl bg-[#0f172a] p-4">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-400">
        <span>My Study List</span>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#1f2937] px-2 py-1 text-[11px] text-gray-300">{itemCountLabel}</span>
          <button
            type="button"
            onClick={onAdd}
            disabled={!canAdd}
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition",
              canAdd
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "cursor-not-allowed bg-[#1f2937] text-gray-500"
            )}
          >
            <span className="text-lg leading-none">+</span>
            <span>Add</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const changePositive = item.changePercent >= 0;
          const changeClass = changePositive ? "text-green-400" : "text-red-400";
          const changeLabel = `${changePositive ? "+" : ""}${item.change.toFixed(2)} (${item.changePercent.toFixed(2)}%)`;

          return (
            <div
              key={item.id}
              className="group relative flex items-center justify-between rounded-md bg-[#111827] px-3 py-3 transition hover:bg-[#1f2937]"
            >
              <button
                type="button"
                onClick={() => onSelect(item.symbol)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{item.symbol}</span>
                  <span className="text-xs text-gray-400">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{item.price.toFixed(2)}</div>
                  <div className={cn("text-xs", changeClass)}>{changeLabel}</div>
                </div>
              </button>
              <button
                type="button"
                aria-label={`Remove ${item.symbol}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(item.id);
                }}
                className="absolute right-2 top-2 rounded p-1 text-gray-500 opacity-0 transition hover:bg-[#1f2937] hover:text-white group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StudyList;
