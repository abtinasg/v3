import TerminalHeader from '@/components/terminal/TerminalHeader';
import { Providers } from '../providers';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex min-h-screen flex-col bg-[#0a0e17]">
        <TerminalHeader />
        <main className="flex flex-1 flex-col">
          {children}
        </main>
      </div>
    </Providers>
  );
}
