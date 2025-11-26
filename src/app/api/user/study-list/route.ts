import { NextResponse } from 'next/server';
import { 
  getAuthUser, 
  AuthError, 
  successResponse, 
  errorResponse,
  parseJsonBody,
  ValidationError,
} from '@/lib/api';
import { 
  getStudyList, 
  addToStudyList, 
  canAddToStudyList,
  StudyListError,
} from '@/lib/user/study-list';

// =============================================================================
// TYPES
// =============================================================================

interface StudyListItemResponse {
  id: string;
  symbol: string;
  name: string;
  addedAt: string;
  currentPrice: number | null;
  change: number | null;
  changePercent: number | null;
}

interface StudyListResponse {
  items: StudyListItemResponse[];
  limit: number;
  canAdd: boolean;
}

interface AddToStudyListRequest {
  symbol: string;
}

// =============================================================================
// GET /api/user/study-list
// =============================================================================

/**
 * GET /api/user/study-list
 * 
 * Returns the authenticated user's study list with current quotes
 * Requires authentication
 */
export async function GET() {
  try {
    // 1. Require auth
    const user = await getAuthUser();

    // 2. Get user's study list with quotes
    const studyList = await getStudyList(user.id);

    // 3. Get canAdd status
    const canAddResult = await canAddToStudyList(user.id);

    // 4. Format response
    const items: StudyListItemResponse[] = studyList?.items.map((item) => ({
      id: item.id,
      symbol: item.symbol,
      name: item.quote?.name ?? item.symbol,
      addedAt: item.addedAt.toISOString(),
      currentPrice: item.quote?.price ?? null,
      change: item.quote?.change ?? null,
      changePercent: item.quote?.changePercent ?? null,
    })) ?? [];

    const response: StudyListResponse = {
      items,
      limit: canAddResult.limit,
      canAdd: canAddResult.canAdd,
    };

    return NextResponse.json(successResponse(response));
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse('UNAUTHORIZED');
    }
    console.error('Error in GET /api/user/study-list:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch study list');
  }
}

// =============================================================================
// POST /api/user/study-list
// =============================================================================

/**
 * POST /api/user/study-list
 * 
 * Adds a stock symbol to the user's study list
 * Requires authentication
 */
export async function POST(request: Request) {
  try {
    // 1. Require auth
    const user = await getAuthUser();

    // 2. Parse body: { symbol: string }
    const body = await parseJsonBody<AddToStudyListRequest>(request);
    const { symbol } = body;

    // 3. Validate symbol
    if (!symbol || typeof symbol !== 'string') {
      return errorResponse('INVALID_REQUEST', 'Symbol is required');
    }

    // 4. Check limits & add to study list (handled in addToStudyList)
    const updatedList = await addToStudyList(user.id, symbol);

    // 5. Get canAdd status for updated list
    const canAddResult = await canAddToStudyList(user.id);

    // 6. Return updated list
    const items: StudyListItemResponse[] = updatedList.items.map((item) => ({
      id: item.id,
      symbol: item.symbol,
      name: item.quote?.name ?? item.symbol,
      addedAt: item.addedAt.toISOString(),
      currentPrice: item.quote?.price ?? null,
      change: item.quote?.change ?? null,
      changePercent: item.quote?.changePercent ?? null,
    }));

    const response: StudyListResponse = {
      items,
      limit: canAddResult.limit,
      canAdd: canAddResult.canAdd,
    };

    return NextResponse.json(successResponse(response));
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse('UNAUTHORIZED');
    }
    
    if (error instanceof ValidationError) {
      return errorResponse('INVALID_REQUEST', error.message);
    }
    
    if (error instanceof StudyListError) {
      switch (error.code) {
        case 'LIMIT_REACHED':
          return errorResponse('FORBIDDEN', error.message, 403);
        case 'ALREADY_EXISTS':
          return errorResponse('INVALID_REQUEST', error.message);
        case 'INVALID_SYMBOL':
          return errorResponse('INVALID_SYMBOL', error.message);
        case 'NOT_FOUND':
          return errorResponse('NOT_FOUND', error.message);
        default:
          return errorResponse('INTERNAL_ERROR', error.message);
      }
    }
    
    console.error('Error in POST /api/user/study-list:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to add to study list');
  }
}
