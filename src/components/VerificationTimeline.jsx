import React from 'react';
import { Check, AlertTriangle, X } from 'lucide-react';
import { format } from 'date-fns';
import { getFreshnessStatus } from '../utils/verification';

export default function VerificationTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return <div className="text-text-muted text-sm italic">No verification history available.</div>;
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((event, eventIdx) => {
          const freshness = getFreshnessStatus(event.date);
          let dotColor = 'bg-pending';
          let Icon = AlertTriangle;
          
          if (event.status === 'verified' || event.status === 'success') {
            dotColor = 'bg-verified';
            Icon = Check;
          } else if (event.status === 'failed' || event.status === 'rejected') {
            dotColor = 'bg-failed';
            Icon = X;
          } else if (!event.status) {
            dotColor = 'bg-accent';
            Icon = Check;
          }

          return (
            <li key={event.id || eventIdx}>
              <div className="relative pb-8">
                {eventIdx !== history.length - 1 ? (
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${dotColor} text-white`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm font-medium text-text">{event.title || event.event}</p>
                      {event.detail && (
                        <p className="mt-1 text-sm text-text-secondary">{event.detail}</p>
                      )}
                      {event.date && (
                        <span className={`mt-2 inline-flex rounded px-2 py-0.5 text-xs font-medium ${freshness.bgColor} ${freshness.color}`}>
                          {freshness.label}
                        </span>
                      )}
                    </div>
                    <div className="text-right text-xs text-text-muted whitespace-nowrap">
                      {event.date ? format(new Date(event.date), 'MMM d, yyyy') : 'Unknown Date'}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
