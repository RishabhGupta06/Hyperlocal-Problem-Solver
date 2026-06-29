'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, ThumbsUp, CheckCircle, Share2,
  MessageCircle, Clock, AlertTriangle, Sparkles, Send
} from 'lucide-react';
import {
  getIssueById, upvoteIssue, verifyIssue,
  getComments, addComment, getUserById, CATEGORIES
} from '@/app/lib/store';
import { calculatePriority, estimateResolutionTime } from '@/app/lib/ai';
import CategoryChip from '@/app/components/CategoryChip';
import StatusTimeline from '@/app/components/StatusTimeline';
import MapView from '@/app/components/MapView';

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const foundIssue = getIssueById(params.id);
    if (foundIssue) {
      setIssue(foundIssue);
      setComments(getComments(params.id));
    }
    setLoaded(true);
  }, [params.id]);

  const handleUpvote = () => {
    if (hasVoted) return;
    const updated = upvoteIssue(issue.id);
    if (updated) {
      setIssue(updated);
      setHasVoted(true);
    }
  };

  const handleVerify = () => {
    if (hasVerified) return;
    const updated = verifyIssue(issue.id);
    if (updated) {
      setIssue(updated);
      setHasVerified(true);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(issue.id, newComment.trim());
    setComments(getComments(issue.id));
    setNewComment('');
  };

  if (!loaded) {
    return (
      <div className="page-content">
        <div className="skeleton" style={{ height: '300px', marginBottom: '20px' }} />
        <div className="skeleton" style={{ height: '200px' }} />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <h2 className="empty-state-title">Issue Not Found</h2>
        <p className="empty-state-text">This issue may have been removed or doesn&apos;t exist.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const category = CATEGORIES.find(c => c.id === issue.category);
  const reporter = getUserById(issue.reportedBy);
  const priority = calculatePriority(issue);
  const estDays = estimateResolutionTime(issue.category, issue.urgency);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <>
      {/* Back Button */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => router.back()}
        style={{ marginBottom: '16px' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="issue-detail-grid">
        {/* Main Content */}
        <div className="issue-detail-main">
          {/* Header */}
          <div className="glass-card animate-slide-up">
            <div className="issue-detail-meta">
              <CategoryChip category={issue.category} />
              <span className={`chip chip-status ${issue.status}`}>
                {issue.status.replace('_', ' ')}
              </span>
              <span className={`chip chip-urgency ${issue.urgency}`}>
                {issue.urgency}
              </span>
            </div>

            <h1 className="issue-detail-title">{issue.title}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} /> {issue.location?.address}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {formatDate(issue.reportedAt)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {reporter?.avatar || '👤'} {reporter?.name || 'Anonymous'}
              </span>
            </div>

            <p className="issue-detail-description">{issue.description}</p>

            {/* Image */}
            {issue.image && (
              <div style={{ marginBottom: '20px' }}>
                <img
                  src={issue.image}
                  alt={issue.title}
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-default)',
                  }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="issue-detail-actions">
              <button
                className={`vote-btn ${hasVoted ? 'active' : ''}`}
                onClick={handleUpvote}
              >
                <ThumbsUp size={16} />
                {issue.upvotes} Upvotes
              </button>

              <button
                className={`vote-btn ${hasVerified ? 'active' : ''}`}
                onClick={handleVerify}
              >
                <CheckCircle size={16} />
                {issue.verifications} Verified
              </button>

              <button
                className="vote-btn"
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
              >
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="glass-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="section-header">
              <h3 className="section-title">
                <MessageCircle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                Comments ({comments.length})
              </h3>
            </div>

            {comments.map((comment) => {
              const user = getUserById(comment.userId);
              return (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">{user?.avatar || '👤'}</div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{user?.name || 'Anonymous'}</span>
                      <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <div className="comment-text">{comment.text}</div>
                  </div>
                </div>
              );
            })}

            {comments.length === 0 && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                No comments yet. Be the first to share your thoughts!
              </div>
            )}

            {/* Add Comment */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <input
                className="form-input"
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary btn-icon"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                style={{ opacity: newComment.trim() ? 1 : 0.5 }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="issue-detail-sidebar">
          {/* AI Analysis */}
          <div className="glass-card animate-slide-in-right">
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h3 className="section-title" style={{ fontSize: '15px' }}>
                <Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                AI Analysis
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Priority Score</span>
                <span style={{
                  fontSize: '18px', fontWeight: 800, fontFamily: 'Outfit',
                  color: priority > 70 ? '#ef4444' : priority > 50 ? '#f59e0b' : '#10b981'
                }}>
                  {priority}/100
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Priority</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{priority}%</span>
                </div>
                <div className="xp-bar">
                  <div
                    className="xp-bar-fill"
                    style={{
                      width: `${priority}%`,
                      background: priority > 70
                        ? 'linear-gradient(135deg, #ef4444, #f97316)'
                        : priority > 50
                          ? 'linear-gradient(135deg, #f59e0b, #f97316)'
                          : 'var(--gradient-success)'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Est. Resolution</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                  {estDays} days
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Category Match</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-purple)' }}>
                  {category?.label}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="glass-card animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
            <h3 className="section-title" style={{ fontSize: '15px', marginBottom: '16px' }}>
              Status Timeline
            </h3>
            <StatusTimeline statusHistory={issue.statusHistory} />
          </div>

          {/* Location Map */}
          <div className="glass-card animate-slide-in-right" style={{ animationDelay: '0.2s', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 0' }}>
              <h3 className="section-title" style={{ fontSize: '15px', marginBottom: '12px' }}>
                📍 Location
              </h3>
            </div>
            <MapView
              issues={[issue]}
              center={[issue.location?.lat || 28.6139, issue.location?.lng || 77.2090]}
              zoom={15}
              height="200px"
              showPopups={false}
            />
            <div style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {issue.location?.address}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-card animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
            <h3 className="section-title" style={{ fontSize: '15px', marginBottom: '16px' }}>
              Engagement
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent-blue)' }}>
                  {issue.upvotes}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Upvotes</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent-purple)' }}>
                  {issue.verifications}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Verifications</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Outfit', color: '#10b981' }}>
                  {comments.length}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Comments</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Outfit', color: '#f59e0b' }}>
                  {issue.statusHistory.length}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Updates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
