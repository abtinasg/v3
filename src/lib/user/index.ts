import { db } from '@/lib/db';
import type { User } from '@clerk/nextjs/server';

// =============================================================================
// TYPES
// =============================================================================

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  deepScore: number | null;
  personalityType: string | null;
  riskTolerance: string | null;
  experienceLevel: string | null;
  subscription: string;
  aiQuestionsToday: number;
  lastQuestionDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileWithStats extends UserProfile {
  usage: {
    aiQuestionsToday: number;
    aiQuestionsLimit: number;
    studyListCount: number;
    studyListLimit: number;
    canAskAI: boolean;
  };
}

export interface AIUsageResult {
  used: number;
  limit: number;
  canAsk: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TIER_LIMITS = {
  free: {
    aiQuestionsPerDay: 5,
    studyListMaxItems: 3,
  },
  pro: {
    aiQuestionsPerDay: Infinity,
    studyListMaxItems: Infinity,
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a date is today (same calendar day)
 */
function isToday(date: Date | null): boolean {
  if (!date) return false;
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Get limits based on subscription tier
 */
function getLimits(subscription: string) {
  return subscription === 'pro' ? TIER_LIMITS.pro : TIER_LIMITS.free;
}

// =============================================================================
// USER SERVICE FUNCTIONS
// =============================================================================

/**
 * Sync user profile from Clerk to database
 * Creates new profile if not exists, updates email/name if changed
 */
export async function syncUserProfile(clerkUser: User): Promise<UserProfile> {
  const { id: clerkId, emailAddresses, firstName, lastName } = clerkUser;
  
  const email = emailAddresses[0]?.emailAddress ?? '';
  const name = [firstName, lastName].filter(Boolean).join(' ') || null;

  // Check if user exists
  const existingProfile = await db.userProfile.findUnique({
    where: { clerkId },
  });

  if (!existingProfile) {
    // Create new profile
    const newProfile = await db.userProfile.create({
      data: {
        clerkId,
        email,
        name,
        subscription: 'free',
        aiQuestionsToday: 0,
      },
    });

    return newProfile;
  }

  // Update email/name if changed
  if (existingProfile.email !== email || existingProfile.name !== name) {
    const updatedProfile = await db.userProfile.update({
      where: { clerkId },
      data: {
        email,
        name,
      },
    });

    return updatedProfile;
  }

  return existingProfile;
}

/**
 * Get user profile with usage stats
 */
export async function getProfile(clerkId: string): Promise<UserProfileWithStats | null> {
  const profile = await db.userProfile.findUnique({
    where: { clerkId },
    include: {
      studyLists: {
        include: {
          _count: {
            select: { items: true },
          },
        },
      },
    },
  });

  if (!profile) {
    return null;
  }

  // Calculate study list count (total items across all lists)
  const studyListCount = profile.studyLists.reduce(
    (total, list) => total + list._count.items,
    0
  );

  // Get limits based on subscription
  const limits = getLimits(profile.subscription);

  // Check if AI questions should be reset (new day)
  const aiQuestionsToday = isToday(profile.lastQuestionDate)
    ? profile.aiQuestionsToday
    : 0;

  const canAskAI = limits.aiQuestionsPerDay === Infinity || 
    aiQuestionsToday < limits.aiQuestionsPerDay;

  // Remove studyLists from profile to avoid type conflicts
  const { studyLists: _, ...profileData } = profile;

  return {
    ...profileData,
    usage: {
      aiQuestionsToday,
      aiQuestionsLimit: limits.aiQuestionsPerDay === Infinity ? -1 : limits.aiQuestionsPerDay,
      studyListCount,
      studyListLimit: limits.studyListMaxItems === Infinity ? -1 : limits.studyListMaxItems,
      canAskAI,
    },
  };
}

/**
 * Update user's Deep Score and related personality data
 */
export async function updateDeepScore(
  clerkId: string,
  score: number,
  personality: string,
  riskTolerance: string
): Promise<UserProfile> {
  const updatedProfile = await db.userProfile.update({
    where: { clerkId },
    data: {
      deepScore: score,
      personalityType: personality,
      riskTolerance,
    },
  });

  return updatedProfile;
}

/**
 * Increment AI usage counter
 * Resets counter if last question was on a different day
 */
export async function incrementAIUsage(clerkId: string): Promise<AIUsageResult> {
  const profile = await db.userProfile.findUnique({
    where: { clerkId },
    select: {
      aiQuestionsToday: true,
      lastQuestionDate: true,
      subscription: true,
    },
  });

  if (!profile) {
    throw new Error('User profile not found');
  }

  const limits = getLimits(profile.subscription);
  const today = new Date();

  // Check if last question was today
  const isNewDay = !isToday(profile.lastQuestionDate);

  // Calculate new usage count
  const newUsageCount = isNewDay ? 1 : profile.aiQuestionsToday + 1;

  // Update the profile
  await db.userProfile.update({
    where: { clerkId },
    data: {
      aiQuestionsToday: newUsageCount,
      lastQuestionDate: today,
    },
  });

  const limit = limits.aiQuestionsPerDay === Infinity ? -1 : limits.aiQuestionsPerDay;
  const canAsk = limits.aiQuestionsPerDay === Infinity || newUsageCount < limits.aiQuestionsPerDay;

  return {
    used: newUsageCount,
    limit,
    canAsk,
  };
}

/**
 * Check if user can ask AI questions (without incrementing)
 */
export async function checkAIUsage(clerkId: string): Promise<AIUsageResult> {
  const profile = await db.userProfile.findUnique({
    where: { clerkId },
    select: {
      aiQuestionsToday: true,
      lastQuestionDate: true,
      subscription: true,
    },
  });

  if (!profile) {
    throw new Error('User profile not found');
  }

  const limits = getLimits(profile.subscription);

  // Check if questions should be reset (new day)
  const currentUsage = isToday(profile.lastQuestionDate)
    ? profile.aiQuestionsToday
    : 0;

  const limit = limits.aiQuestionsPerDay === Infinity ? -1 : limits.aiQuestionsPerDay;
  const canAsk = limits.aiQuestionsPerDay === Infinity || currentUsage < limits.aiQuestionsPerDay;

  return {
    used: currentUsage,
    limit,
    canAsk,
  };
}

// =============================================================================
// STUDY LIST EXPORTS
// =============================================================================

export {
  getStudyList,
  addToStudyList,
  removeFromStudyList,
  removeSymbolFromStudyList,
  canAddToStudyList,
  StudyListError,
  type StudyListWithQuotes,
  type StudyListItemWithQuote,
  type CanAddResult,
  type StudyListErrorCode,
} from './study-list';
