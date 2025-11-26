import { formatDistanceToNow } from "date-fns";
import type { NewsItem } from "@/types";

export interface NewsFeedProps {
  items: NewsItem[];
  maxItems?: number;
  isLoading?: boolean;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Fed signals potential rate cut in 2024",
    summary: "Federal Reserve officials indicate openness to easing monetary policy if inflation continues to moderate.",
    source: "Reuters",
    url: "#",
    publishedAt: new Date(),
    symbols: [],
    sentiment: null,
    relevanceScore: 0.86,
  },
  {
    id: "2",
    title: "Tech stocks rally on AI optimism",
    summary: "Major technology companies surge as investors bet on continued growth in artificial intelligence.",
    source: "Bloomberg",
    url: "#",
    publishedAt: new Date(),
    symbols: [],
    sentiment: null,
    relevanceScore: 0.78,
  },
  {
    id: "3",
    title: "Oil prices retreat as supply concerns ease",
    summary: "Crude futures slide after reports of increased production capacity from key OPEC members.",
    source: "Wall Street Journal",
    url: "#",
    publishedAt: new Date(),
    symbols: [],
    sentiment: null,
    relevanceScore: 0.65,
  },
  {
    id: "4",
    title: "Earnings season kicks off with banks reporting mixed results",
    summary: "Large financial institutions deliver varied performance as higher rates bolster margins but weigh on dealmaking.",
    source: "CNBC",
    url: "#",
    publishedAt: new Date(),
    symbols: [],
    sentiment: null,
    relevanceScore: 0.71,
  },
];

export function NewsFeed({ items, maxItems = 6, isLoading = false }: NewsFeedProps) {
  const displayItems = (items?.length ? items : MOCK_NEWS).slice(0, maxItems);

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">MARKET NEWS</div>
      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {isLoading
          ? Array.from({ length: Math.min(maxItems, 6) }).map((_, index) => (
              <div
                key={`news-loading-${index}`}
                className="h-16 animate-pulse rounded-md bg-[#1f2937]"
              />
            ))
          : displayItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-md border border-transparent bg-[#1f2937] p-3 transition-colors hover:border-blue-500 hover:bg-[#374151]"
              >
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                    {item.title}
                  </h3>
                  <div className="text-xs text-gray-400">
                    {item.source}
                    {item.publishedAt && (
                      <>
                        <span className="mx-1">•</span>
                        <span>
                          {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </a>
            ))}
      </div>
    </div>
  );
}

export default NewsFeed;
