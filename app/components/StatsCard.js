'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ icon, value, label, trend, trendValue, color = 'blue', delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numValue = typeof value === 'number' ? value : parseInt(value) || 0;
    const duration = 1200;
    const startTime = Date.now();

    const timer = setTimeout(() => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(numValue * eased));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className={`stat-card ${color} animate-slide-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-card-header">
        <div className={`stat-card-icon ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className={`stat-card-trend ${trend}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}
          </span>
        )}
      </div>
      <div className="stat-card-value">
        {typeof value === 'string' && value.includes('%')
          ? `${displayValue}%`
          : displayValue}
      </div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
