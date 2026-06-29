'use client';

export default function StatusTimeline({ statusHistory }) {
  if (!statusHistory || statusHistory.length === 0) return null;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      reported: 'Issue Reported',
      verified: 'Community Verified',
      in_progress: 'Work In Progress',
      resolved: 'Issue Resolved',
      rejected: 'Issue Rejected',
    };
    return labels[status] || status;
  };

  return (
    <div className="timeline">
      {statusHistory.map((entry, index) => (
        <div key={index} className="timeline-item animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <div className={`timeline-dot ${entry.status}`} />
          <div className="timeline-content">
            <div className="timeline-status" style={{ color: getStatusColor(entry.status) }}>
              {getStatusLabel(entry.status)}
            </div>
            <div className="timeline-date">{formatDate(entry.date)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    reported: '#3b82f6',
    verified: '#8b5cf6',
    in_progress: '#f59e0b',
    resolved: '#10b981',
    rejected: '#ef4444',
  };
  return colors[status] || '#64748b';
}
