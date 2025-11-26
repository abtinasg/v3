import { db } from '@/lib/db';
import { getQuote, getMultipleQuotes, type ExtendedStockQuote } from '@/lib/market';
import type { StockQuote } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Study list item with enriched quote data
 */
export interface StudyListItemWithQuote {
  id: string;
  listId: string;
  symbol: string;
  addedAt: Date;
  quote: StockQuote | null;
  priceAtAdd?: number;
  gainSinceAdd?: number;
}

/**
 * Study list with all items and their quotes
 */
export interface StudyListWithQuotes {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  items: StudyListItemWithQuote[];
  itemCount: number;
}

/**
 * Check result for canAddToStudyList
 */
export interface CanAddResult {
  canAdd: boolean;
  current: number;
  limit: number;
}

/**
 * Study list error codes
 */
export type StudyListErrorCode = 
  | 'LIMIT_REACHED'
  | 'ALREADY_EXISTS'
  | 'INVALID_SYMBOL'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED';

/**
 * Custom error class for study list operations
 */
export class StudyListError extends Error {
  code: StudyListErrorCode;
  
  constructor(code: StudyListErrorCode, message: string) {
    super(message);
    this.name = 'StudyListError';
    this.code = code;
  }
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Study list item limits per subscription tier
 */
const STUDY_LIST_LIMITS = {
  free: 3,
  pro: Infinity,
} as const;

// =============================================================================
// FUNCTION 1: GET STUDY LIST
// =============================================================================

/**
 * Get user's study list with all items and current quotes
 * @param userId - The user's internal database ID (UUID)
 * @returns StudyListWithQuotes or null if no study list exists
 */
export async function getStudyList(userId: string): Promise<StudyListWithQuotes | null> {
  // Get or create study list for user
  const studyList = await db.studyList.findFirst({
    where: { userId },
    include: {
      items: {
        orderBy: { addedAt: 'desc' },
      },
    },
  });

  if (!studyList) {
    return null;
  }

  // No items, return empty list
  if (studyList.items.length === 0) {
    return {
      id: studyList.id,
      userId: studyList.userId,
      name: studyList.name,
      createdAt: studyList.createdAt,
      items: [],
      itemCount: 0,
    };
  }

  // Fetch current quotes for all symbols in parallel
  const symbols = studyList.items.map((item) => item.symbol);
  const quotes = await getMultipleQuotes(symbols);
  
  // Create a map for quick lookup
  const quoteMap = new Map<string, ExtendedStockQuote>();
  for (const quote of quotes) {
    quoteMap.set(quote.symbol.toUpperCase(), quote);
  }

  // Enrich items with quote data
  const itemsWithQuotes: StudyListItemWithQuote[] = studyList.items.map((item) => {
    const quote = quoteMap.get(item.symbol.toUpperCase()) || null;
    
    return {
      id: item.id,
      listId: item.listId,
      symbol: item.symbol,
      addedAt: item.addedAt,
      quote,
    };
  });

  return {
    id: studyList.id,
    userId: studyList.userId,
    name: studyList.name,
    createdAt: studyList.createdAt,
    items: itemsWithQuotes,
    itemCount: itemsWithQuotes.length,
  };
}

// =============================================================================
// FUNCTION 2: ADD TO STUDY LIST
// =============================================================================

/**
 * Add a symbol to user's study list
 * @param userId - The user's internal database ID (UUID)
 * @param symbol - Stock symbol to add (e.g., 'AAPL')
 * @returns Updated StudyListWithQuotes
 * @throws StudyListError with codes: LIMIT_REACHED, ALREADY_EXISTS, INVALID_SYMBOL
 */
export async function addToStudyList(
  userId: string,
  symbol: string
): Promise<StudyListWithQuotes> {
  const upperSymbol = symbol.toUpperCase().trim();

  if (!upperSymbol) {
    throw new StudyListError('INVALID_SYMBOL', 'Symbol cannot be empty');
  }

  // Step 1: Validate symbol exists by fetching quote
  const quote = await getQuote(upperSymbol);
  if (!quote) {
    throw new StudyListError(
      'INVALID_SYMBOL',
      `Invalid or unsupported symbol: ${upperSymbol}`
    );
  }

  // Step 2: Get user to check subscription tier
  const user = await db.userProfile.findUnique({
    where: { id: userId },
    select: { subscription: true },
  });

  if (!user) {
    throw new StudyListError('NOT_FOUND', 'User not found');
  }

  const tier = (user.subscription as 'free' | 'pro') || 'free';
  const limit = STUDY_LIST_LIMITS[tier];

  // Step 3: Get or create study list
  let studyList = await db.studyList.findFirst({
    where: { userId },
    include: { items: true },
  });

  if (!studyList) {
    // Create new study list for user
    studyList = await db.studyList.create({
      data: {
        userId,
        name: 'My Study List',
      },
      include: { items: true },
    });
  }

  // Step 4: Check if symbol already exists in list
  const existingItem = studyList.items.find(
    (item) => item.symbol.toUpperCase() === upperSymbol
  );

  if (existingItem) {
    throw new StudyListError(
      'ALREADY_EXISTS',
      `${upperSymbol} is already in your study list`
    );
  }

  // Step 5: Check limits
  if (studyList.items.length >= limit) {
    throw new StudyListError(
      'LIMIT_REACHED',
      `Study list limit reached. Free tier allows ${STUDY_LIST_LIMITS.free} items. Upgrade to Pro for unlimited items.`
    );
  }

  // Step 6: Add item to study list
  await db.studyListItem.create({
    data: {
      listId: studyList.id,
      symbol: upperSymbol,
    },
  });

  // Step 7: Return updated list
  const updatedList = await getStudyList(userId);
  if (!updatedList) {
    throw new StudyListError('NOT_FOUND', 'Failed to retrieve updated study list');
  }

  return updatedList;
}

// =============================================================================
// FUNCTION 3: REMOVE FROM STUDY LIST
// =============================================================================

/**
 * Remove an item from user's study list
 * @param userId - The user's internal database ID (UUID)
 * @param itemId - The study list item ID to remove
 * @returns Updated StudyListWithQuotes
 * @throws StudyListError with codes: NOT_FOUND, UNAUTHORIZED
 */
export async function removeFromStudyList(
  userId: string,
  itemId: string
): Promise<StudyListWithQuotes> {
  // Step 1: Find the item and verify it belongs to user's list
  const item = await db.studyListItem.findUnique({
    where: { id: itemId },
    include: {
      list: {
        select: { userId: true },
      },
    },
  });

  if (!item) {
    throw new StudyListError('NOT_FOUND', 'Study list item not found');
  }

  // Step 2: Verify ownership
  if (item.list.userId !== userId) {
    throw new StudyListError(
      'UNAUTHORIZED',
      'You do not have permission to modify this study list'
    );
  }

  // Step 3: Delete the item
  await db.studyListItem.delete({
    where: { id: itemId },
  });

  // Step 4: Return updated list
  const updatedList = await getStudyList(userId);
  
  // If no list exists, return empty list structure
  if (!updatedList) {
    const studyList = await db.studyList.findFirst({
      where: { userId },
    });

    if (studyList) {
      return {
        id: studyList.id,
        userId: studyList.userId,
        name: studyList.name,
        createdAt: studyList.createdAt,
        items: [],
        itemCount: 0,
      };
    }

    throw new StudyListError('NOT_FOUND', 'Study list not found');
  }

  return updatedList;
}

// =============================================================================
// FUNCTION 4: CAN ADD TO STUDY LIST
// =============================================================================

/**
 * Check if user can add more items to their study list
 * @param userId - The user's internal database ID (UUID)
 * @returns CanAddResult with canAdd status, current count, and limit
 */
export async function canAddToStudyList(userId: string): Promise<CanAddResult> {
  // Get user subscription tier
  const user = await db.userProfile.findUnique({
    where: { id: userId },
    select: { subscription: true },
  });

  const tier = ((user?.subscription as 'free' | 'pro') || 'free');
  const limit = STUDY_LIST_LIMITS[tier];

  // Get current item count
  const studyList = await db.studyList.findFirst({
    where: { userId },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  const current = studyList?._count?.items ?? 0;

  return {
    canAdd: current < limit,
    current,
    limit: limit === Infinity ? -1 : limit, // Use -1 to represent unlimited
  };
}

// =============================================================================
// HELPER: REMOVE BY SYMBOL
// =============================================================================

/**
 * Remove a symbol from user's study list (alternative to removeFromStudyList)
 * @param userId - The user's internal database ID (UUID)
 * @param symbol - Stock symbol to remove
 * @returns Updated StudyListWithQuotes
 * @throws StudyListError with codes: NOT_FOUND
 */
export async function removeSymbolFromStudyList(
  userId: string,
  symbol: string
): Promise<StudyListWithQuotes> {
  const upperSymbol = symbol.toUpperCase().trim();

  // Find the user's study list
  const studyList = await db.studyList.findFirst({
    where: { userId },
    include: { items: true },
  });

  if (!studyList) {
    throw new StudyListError('NOT_FOUND', 'Study list not found');
  }

  // Find the item with this symbol
  const item = studyList.items.find(
    (i) => i.symbol.toUpperCase() === upperSymbol
  );

  if (!item) {
    throw new StudyListError(
      'NOT_FOUND',
      `${upperSymbol} is not in your study list`
    );
  }

  // Use the main remove function
  return removeFromStudyList(userId, item.id);
}
