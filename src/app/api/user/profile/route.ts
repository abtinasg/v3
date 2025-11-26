import { NextResponse } from 'next/server';
import { getAuthUser, AuthError, successResponse, errorResponse } from '@/lib/api';
import { getProfile } from '@/lib/user';

/**
 * GET /api/user/profile
 * 
 * Returns the authenticated user's profile with usage stats
 * Requires authentication
 */
export async function GET() {
  try {
    // Require authentication
    const user = await getAuthUser();

    // Get profile with usage stats
    const profileWithStats = await getProfile(user.clerkId);

    if (!profileWithStats) {
      return errorResponse('NOT_FOUND', 'User profile not found');
    }

    // Format response
    const response = {
      id: profileWithStats.id,
      email: profileWithStats.email,
      name: profileWithStats.name,
      subscription: profileWithStats.subscription,
      deepScore: profileWithStats.deepScore,
      personalityType: profileWithStats.personalityType,
      riskTolerance: profileWithStats.riskTolerance,
      createdAt: profileWithStats.createdAt.toISOString(),
      usage: {
        aiQuestionsToday: profileWithStats.usage.aiQuestionsToday,
        aiQuestionsLimit: profileWithStats.usage.aiQuestionsLimit,
        studyListCount: profileWithStats.usage.studyListCount,
        studyListLimit: profileWithStats.usage.studyListLimit,
      },
    };

    return NextResponse.json(successResponse(response));
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse('UNAUTHORIZED');
    }
    console.error('Error in GET /api/user/profile:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch user profile');
  }
}

export async function PUT(request: Request) {
  // TODO: Implement user profile update endpoint
  return NextResponse.json({ message: 'User profile update endpoint' });
}
