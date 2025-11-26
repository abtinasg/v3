'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Page() {
  const { user } = useUser();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  const deepScore = 82;
  const personalityType = 'Strategic Analyst';
  const riskTolerance = 'Moderate';

  const subscriptionTier = 'pro';
  const aiQuestionsUsed = 3;
  const aiQuestionsLimit = 5;
  const studyListUsed = 2;
  const studyListLimit = 3;

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
            <p className="font-semibold text-white">{user?.primaryEmailAddress?.emailAddress ?? 'you@example.com'}</p>
          </div>
          <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'h-12 w-12' } }} />
        </div>
      </div>

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
                <p className="text-lg font-semibold">{user?.fullName ?? 'Your Name'}</p>
                <p className="text-sm text-white/70">
                  {user?.primaryEmailAddress?.emailAddress ?? 'you@example.com'}
                </p>
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
            <Badge className="bg-emerald-500/20 text-emerald-200">Up to date</Badge>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-sm text-white/70">Score</p>
              <p className="text-4xl font-semibold">{deepScore}</p>
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
                Retake Quiz
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
                {aiQuestionsLimit - aiQuestionsUsed} left
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
                {studyListLimit - studyListUsed} remaining
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
    </div>
  );
}
