import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Puzzle Meta Mechanics",
  description: "Database for puzzle games and mechanics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: '1rem 2rem', borderBottom: 'var(--border-width) solid var(--border-color)', marginBottom: '2rem', display: 'flex', gap: '1rem', backgroundColor: 'var(--bg-box)' }}>
          <Link href="/" className="btn" style={{ border: 'none', padding: '0.5rem' }}>Home</Link>
          <Link href="/genres" className="btn" style={{ border: 'none', padding: '0.5rem' }}>Genres</Link>
          <Link href="/mechanics" className="btn" style={{ border: 'none', padding: '0.5rem' }}>Mechanics</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
