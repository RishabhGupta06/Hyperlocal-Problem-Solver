'use client';

import { CATEGORIES } from '@/app/lib/store';

export default function CategoryChip({ category, size = 'md' }) {
  const cat = CATEGORIES.find(c => c.id === category);
  if (!cat) return null;

  const style = {
    '--chip-color': cat.color,
    background: `${cat.color}15`,
    color: cat.color,
    padding: size === 'sm' ? '2px 8px' : '4px 12px',
    fontSize: size === 'sm' ? '10px' : '12px',
  };

  return (
    <span className="chip chip-category" style={style}>
      {cat.icon} {cat.label}
    </span>
  );
}
