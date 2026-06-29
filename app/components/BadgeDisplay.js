'use client';

import { BADGES } from '@/app/lib/gamification';

export default function BadgeDisplay({ userBadges, compact = false }) {
  const badges = userBadges || BADGES.map(b => ({ ...b, earned: false }));

  if (compact) {
    const earned = badges.filter(b => b.earned);
    return (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {earned.map(badge => (
          <span
            key={badge.id}
            title={`${badge.name}: ${badge.description}`}
            style={{ fontSize: '20px', cursor: 'default' }}
          >
            {badge.icon}
          </span>
        ))}
        {earned.length === 0 && (
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            No badges yet
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="badge-grid">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`badge-item ${badge.earned ? 'earned' : 'locked'}`}
          title={badge.description}
        >
          <span className="badge-icon">{badge.icon}</span>
          <span className="badge-name">{badge.name}</span>
          <span className="badge-desc">{badge.description}</span>
        </div>
      ))}
    </div>
  );
}
