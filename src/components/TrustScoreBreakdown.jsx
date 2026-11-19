import React from 'react';
import { trustScoreCategories } from '../utils/trustScore';

export default function TrustScoreBreakdown({ breakdown }) {
  if (!breakdown) return null;

  return (
    <div className="bg-white rounded-lg border border-border p-4 shadow-sm">
      <h3 className="text-lg font-bold text-text mb-4">Trust Score Breakdown</h3>
      <div className="space-y-4">
        {trustScoreCategories.map((category) => {
          const earned = breakdown[category.key] || 0;
          const max = category.maxPoints;
          const percentage = Math.round((earned / max) * 100);
          
          let barColor = 'bg-failed';
          if (percentage >= 80) barColor = 'bg-verified';
          else if (percentage >= 50) barColor = 'bg-accent';
          else if (percentage >= 30) barColor = 'bg-pending';

          return (
            <div key={category.key} className="relative">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-text">{category.label}</span>
                <span className="text-sm font-semibold text-text">{earned} / {max}</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${barColor} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-text-muted mt-1">{category.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
