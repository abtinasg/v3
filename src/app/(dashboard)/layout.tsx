import { UserButton } from '@clerk/nextjs';
import { Providers } from '../providers';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-[#0a0e17]">
        {/* Header */}
        <header className="border-b border-[#1f2937] bg-[#111827]">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Deep</h1>
            </div>

            {/* User Button */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8',
                },
              }}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </Providers>
  );
}
