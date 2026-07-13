import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', borderRight: '2px solid var(--border-color)', padding: '2rem' }}>
        <h2 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>Admin Menu</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/admin/games" className="thinky-title" style={{ textDecoration: 'none' }}>Games</Link>
          <Link href="/admin/mechanics" className="thinky-title" style={{ textDecoration: 'none' }}>Mechanics</Link>
          <Link href="/admin/groups" className="thinky-title" style={{ textDecoration: 'none' }}>Mechanic Groups</Link>
          <Link href="/admin/genres" className="thinky-title" style={{ textDecoration: 'none' }}>Genres</Link>
          <Link href="/admin/platforms" className="thinky-title" style={{ textDecoration: 'none' }}>Platforms</Link>
          <hr style={{ borderColor: 'var(--border-color)', width: '100%' }} />
          <Link href="/admin/import" className="thinky-title" style={{ textDecoration: 'none' }}>JSON Import</Link>
          <hr style={{ borderColor: 'var(--border-color)', width: '100%' }} />
          <Link href="/" className="thinky-title" style={{ textDecoration: 'none' }}>← Back to Site</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px' }}>
        {children}
      </main>
    </div>
  );
}
