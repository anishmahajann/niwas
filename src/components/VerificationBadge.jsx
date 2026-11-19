import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';
import { getTimeSince } from '../utils/verification';

export default function VerificationBadge({ status, label, date, showDate = false }) {
  let config = {
    icon: Clock,
    color: 'text-text-muted',
    bg: 'bg-surface',
    border: 'border-border'
  };

  if (status === 'verified') {
    config = {
      icon: CheckCircle2,
      color: 'text-verified',
      bg: 'bg-verified-light',
      border: 'border-verified/20'
    };
  } else if (status === 'pending') {
    config = {
      icon: AlertCircle,
      color: 'text-pending',
      bg: 'bg-pending-light',
      border: 'border-pending/20'
    };
  } else if (status === 'failed' || status === 'rejected') {
    config = {
      icon: XCircle,
      color: 'text-failed',
      bg: 'bg-failed-light',
      border: 'border-failed/20'
    };
  }

  const Icon = config.icon;
  const displayLabel = label
    ? label.replace(/(^\w|\s\w)/g, (word) => word.toUpperCase()).replaceAll('_', ' ')
    : status?.replace(/(^\w|\s\w)/g, (word) => word.toUpperCase()).replaceAll('_', ' ');

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color} ${config.border}`}>
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {displayLabel}
      {showDate && date && (
        <span className="ml-1 opacity-80 font-normal">
          • {getTimeSince(date)}
        </span>
      )}
    </div>
  );
}
