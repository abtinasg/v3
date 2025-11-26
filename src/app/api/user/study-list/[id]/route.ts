import { NextResponse } from 'next/server';
import { 
  getAuthUser, 
  AuthError, 
  successResponse, 
  errorResponse,
} from '@/lib/api';
import { 
  removeFromStudyList, 
  StudyListError,
} from '@/lib/user/study-list';

// =============================================================================
// DELETE /api/user/study-list/[id]
// =============================================================================

interface DeleteResponse {
  removed: boolean;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/user/study-list/[id]
 * 
 * Removes an item from the user's study list
 * Requires authentication
 */
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    // 1. Require auth
    const user = await getAuthUser();

    // 2. Extract item id from params
    const { id } = await context.params;

    if (!id) {
      return errorResponse('INVALID_REQUEST', 'Item ID is required');
    }

    // 3. Remove from study list
    await removeFromStudyList(user.id, id);

    // 4. Return success
    const response: DeleteResponse = {
      removed: true,
    };

    return NextResponse.json(successResponse(response));
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse('UNAUTHORIZED');
    }
    
    if (error instanceof StudyListError) {
      switch (error.code) {
        case 'NOT_FOUND':
          return errorResponse('NOT_FOUND', error.message);
        case 'UNAUTHORIZED':
          return errorResponse('FORBIDDEN', error.message, 403);
        default:
          return errorResponse('INTERNAL_ERROR', error.message);
      }
    }
    
    console.error('Error in DELETE /api/user/study-list/[id]:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to remove from study list');
  }
}
