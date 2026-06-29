'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, ChevronRight } from 'lucide-react';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/report': 'Report Issue',
  '/map': 'Live Map',
  '/analytics': 'Analytics',
  '/leaderboard': 'Leaderboard',
};

export default function TopBar({ collapsed, currentUser }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  // Get page title
  let pageTitle = PAGE_TITLES[pathname] || 'Issue Detail';
  if (pathname.startsWith('/issues/')) pageTitle = 'Issue Detail';

  return (
    <header className={`topbar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="topbar-left">
        <div className="topbar-breadcrumb">
          <span>Community Hero</span>
          <ChevronRight size={14} />
          <span className="current">{pageTitle}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <Search size={16} className="topbar-search-icon" />
          <input
            type="text"
            placeholder="Search issues, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className="topbar-icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="topbar-notification-badge" />
        </button>

        <div className="topbar-avatar" title={currentUser?.name || 'User'}>
          {currentUser?.avatar || '👨‍💻'}
        </div>
      </div>
    </header>
  );
}
