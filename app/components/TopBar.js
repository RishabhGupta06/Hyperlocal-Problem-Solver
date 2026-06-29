'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, Bell, LogOut, LayoutDashboard, 
  FilePlus, Map, BarChart3, Trophy 
} from 'lucide-react';
import { logout } from '../lib/store';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/report', label: 'Report Issue', icon: FilePlus, highlight: true },
  { href: '/map', label: 'Live Map', icon: Map },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function TopBar({ currentUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="topbar">
      {/* Left: Logo */}
      <div className="topbar-logo">
        <div className="topbar-logo-icon">🏛️</div>
        <span className="topbar-logo-text">Community Hero</span>
      </div>

      {/* Center: Navigation */}
      <nav className="topbar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <Icon size={18} />
              </span>
              <span className="nav-label">{item.label}</span>
              {item.highlight && (
                <span className="nav-badge">New</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right: Controls & Profile */}
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
        
        <button 
          className="topbar-icon-btn" 
          title="Logout"
          onClick={handleLogout}
          style={{ marginLeft: '8px' }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
