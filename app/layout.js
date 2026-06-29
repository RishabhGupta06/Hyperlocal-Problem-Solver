'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { initializeStore, getCurrentUser } from './lib/store';
import './globals.css';

export default function RootLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    initializeStore();
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsInitialized(true);
    
    // Auth guard
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, router]);

  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <head>
        <title>Community Hero — Hyperlocal Problem Solver</title>
        <meta name="description" content="Report, track, and resolve community issues through collaboration, data, and intelligent automation. Make your neighborhood better." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Community Hero — Hyperlocal Problem Solver" />
        <meta property="og:description" content="Empowering citizens to identify, report, and resolve community issues together." />
        <meta property="og:type" content="website" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏛️</text></svg>" />
      </head>
      <body>
        {!isInitialized ? (
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          </div>
        ) : isLoginPage ? (
          children
        ) : (
          <div className="app-layout">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            <main className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
              <TopBar collapsed={collapsed} currentUser={currentUser} />
              <div className="page-content">
                {children}
              </div>
            </main>
          </div>
        )}
      </body>
    </html>
  );
}
