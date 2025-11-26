import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      afterSignOutUrl="/"
    >
      <html lang="en">
        <body className="min-h-screen antialiased bg-white dark:bg-black">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
