'use client';

import Link from 'next/link';
import { MapPin, ThumbsUp, Clock, CheckCircle } from 'lucide-react';
import { CATEGORIES } from '@/app/lib/store';
import CategoryChip from './CategoryChip';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function IssueCard({ issue, compact = false }) {
  const category = CATEGORIES.find(c => c.id === issue.category);

  return (
    <Link href={`/issues/${issue.id}`} className="issue-card">
      <div className="issue-card-image">
        {issue.image ? (
          <img src={issue.image} alt={issue.title} />
        ) : (
          category?.icon || '📋'
        )}
      </div>

      <div className="issue-card-content">
        <div className="issue-card-meta">
          <CategoryChip category={issue.category} size="sm" />
          <span className={`chip chip-status ${issue.status}`}>
            {issue.status.replace('_', ' ')}
          </span>
          <span className={`chip chip-urgency ${issue.urgency}`}>
            {issue.urgency}
          </span>
        </div>

        <div className="issue-card-title">{issue.title}</div>

        <div className="issue-card-location">
          <MapPin size={12} />
          {issue.location?.address || 'Unknown location'}
        </div>

        {!compact && (
          <div className="issue-card-footer">
            <span className="issue-card-stat">
              <ThumbsUp size={12} />
              {issue.upvotes}
            </span>
            <span className="issue-card-stat">
              <CheckCircle size={12} />
              {issue.verifications} verified
            </span>
            <span className="issue-card-stat">
              <Clock size={12} />
              {timeAgo(issue.reportedAt)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
