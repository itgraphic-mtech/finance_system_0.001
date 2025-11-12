"use client";
import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';

export default function NavBar() {
  const { data: session } = useSession();

  return (
    <nav style={{ backgroundColor: 'white', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#000' }}>Finance AR</Link>
          <Link href="/dashboard" style={{ fontSize: '0.875rem', color: '#4b5563', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/upload" style={{ fontSize: '0.875rem', color: '#4b5563', textDecoration: 'none' }}>Upload</Link>
          <Link href="/reports" style={{ fontSize: '0.875rem', color: '#4b5563', textDecoration: 'none' }}>Reports</Link>
        </div>
        <div>
          {session?.user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem' }}>{(session.user as any).name || session.user?.email}</span>
              <button className="btn-secondary" onClick={() => signOut()}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button className="btn-primary" onClick={() => signIn()}>Login</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
