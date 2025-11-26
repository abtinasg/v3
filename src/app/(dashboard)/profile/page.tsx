'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/hooks';

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-28" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="flex-row items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-20" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-24 rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="flex-row items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-14" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5 lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(value?: string | number | Date) {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRiskTolerance(risk?: string | null) {
  if (!risk) return '—';

  return `${risk.charAt(0).toUpperCase()}${risk.slice(1)}`;
}

export default function Page() {
  const { user } = useUser();
  const { data: profile, isLoading } = useProfile();

  const memberSince = formatDate(profile?.createdAt ?? user?.createdAt);

  const deepScore = profile?.deepScore;
  const personalityType = profile?.personalityType ?? '—';
  const riskTolerance = formatRiskTolerance(profile?.riskTolerance);

  const subscriptionTier = profile?.subscription ?? 'free';
  const aiQuestionsUsed = profile?.usage.aiQuestionsToday ?? 0;
  const aiQuestionsLimit = profile?.usage.aiQuestionsLimit ?? 0;
  const studyListUsed = profile?.usage.studyListCount ?? 0;
  const studyListLimit = profile?.usage.studyListLimit ?? 0;

  const displayName = profile?.name ?? user?.fullName ?? 'Your Name';
  const email = profile?.email ?? user?.primaryEmailAddress?.emailAddress ?? 'you@example.com';

  return (
    <div className="flex-1 bg-[#0a0e17] p-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60">Account &amp; personalization</p>
          <h1 className="text-2xl font-semibold">Profile</h1>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <div className="text-right text-xs text-white/70">
            <p>Signed in as</p>
            <p className="font-semibold text-white">{email}</p>
          </div>
          <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'h-12 w-12' } }} />
        </div>
      </div>

      {isLoading && !profile ? (
        <ProfileSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>User info</CardTitle>
              <CardDescription>Manage your personal details</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'h-16 w-16' } }} />
                <div>
                  <p className="text-lg font-semibold">{displayName}</p>
                  <p className="text-sm text-white/70">{email}</p>
                  <p className="text-xs text-white/50">Member since {memberSince}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Deep Score</CardTitle>
                <CardDescription>Your personalized investing profile</CardDescription>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-200">
                {deepScore ? 'Up to date' : 'Pending'}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-sm text-white/70">Score</p>
                <p className="text-4xl font-semibold">{deepScore ?? '—'}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm text-white/70">Personality</p>
                    <p className="font-semibold">{personalityType}</p>
                  </div>
                  <Badge variant="outline" className="border-blue-400/50 text-blue-200">
                    Investor DNA
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm text-white/70">Risk tolerance</p>
                    <p className="font-semibold">{riskTolerance}</p>
                  </div>
                  <Badge variant="outline" className="border-orange-400/50 text-orange-200">
                    Stable
                  </Badge>
                </div>
                <Button className="w-full" variant="outline">
                  {deepScore ? 'Retake Quiz' : 'Take Quiz'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Your current plan and billing</CardDescription>
              </div>
              <Badge variant="outline" className="border-purple-400/50 text-purple-200">
                {subscriptionTier === 'pro' ? 'Pro' : 'Free'}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm text-white/70">Current tier</p>
                  <p className="text-lg font-semibold capitalize">{subscriptionTier}</p>
                </div>
                <div className="text-right text-sm text-white/60">
                  <p>Priority AI access</p>
                  <p>Extended study list</p>
                </div>
              </div>
              {subscriptionTier === 'free' ? (
                <Button className="w-full">Upgrade to Pro</Button>
              ) : (
                <div className="flex gap-3">
                  <Button variant="outline" className="w-full">
                    Manage subscription
                  </Button>
                  <Button className="w-full">Add credits</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Usage stats</CardTitle>
              <CardDescription>Daily limits and reset time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm text-white/70">AI questions</p>
                  <p className="text-lg font-semibold">
                    {aiQuestionsUsed}/{aiQuestionsLimit} today
                  </p>
                </div>
                <Badge variant="outline" className="border-white/20 text-white/80">
                  {Math.max(aiQuestionsLimit - aiQuestionsUsed, 0)} left
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm text-white/70">Study list</p>
                  <p className="text-lg font-semibold">
                    {studyListUsed}/{studyListLimit} stocks
                  </p>
                </div>
                <Badge variant="outline" className="border-white/20 text-white/80">
                  {Math.max(studyListLimit - studyListUsed, 0)} remaining
                </Badge>
              </div>
              <Separator className="bg-white/10" />
              <p className="text-sm text-white/70">Resets daily at 12:00 AM UTC</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 lg:col-span-2">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Control appearance and account safety</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold">Theme</p>
                  <p className="text-sm text-white/60">Light / dark toggle coming soon</p>
                </div>
                <Badge variant="outline" className="border-white/20 text-white/70">
                  Pending
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold">Notifications</p>
                  <p className="text-sm text-white/60">Email and push controls coming soon</p>
                </div>
                <Badge variant="outline" className="border-white/20 text-white/70">
                  Pending
                </Badge>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex flex-col gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                <div>
                  <p className="font-semibold text-red-100">Delete account</p>
                  <p className="text-sm text-red-200/80">
                    Permanently remove your data and access. This action cannot be undone.
                  </p>
                </div>
                <Button variant="destructive" className="self-start">
                  Delete account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
