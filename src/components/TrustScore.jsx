import React from 'react';
import { getTrustScoreLabel, getTrustScoreColor } from '../utils/trustScore';

export default function TrustScore({ score, size = 'md' }) {
  const label = getTrustScoreLabel(score);
  const colorClass = getTrustScoreColor(score);
  
  const sizeMap = {
    sm: { svg: 48, stroke: 4, text: 'text-sm' },
    md: { svg: 80, stroke: 6, text: 'text-2xl' },
    lg: { svg: 120, stroke: 8, text: 'text-4xl' }
  };
  
  const currentSize = sizeMap[size];
  const radius = (currentSize.svg - currentSize.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  
  // Convert Tailwind color classes to generic hex for SVG stroke if possible, 
  // or use currentColor and text classes
  let strokeColor = '#ef4444'; // failed
  if (score >= 80) strokeColor = 'var(--color-verified, #10b981)';
  else if (score >= 60) strokeColor = 'var(--color-accent, #0d9488)';
  else if (score >= 40) strokeColor = 'var(--color-pending, #f59e0b)';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: currentSize.svg, height: currentSize.svg }}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx={currentSize.svg / 2}
            cy={currentSize.svg / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={currentSize.stroke}
            fill="transparent"
            className="text-border"
          />
          <circle
            cx={currentSize.svg / 2}
            cy={currentSize.svg / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={currentSize.stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-in-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-text ${currentSize.text}`}>{score}</span>
        </div>
      </div>
      <div className={`mt-2 font-semibold ${colorClass} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {label}
      </div>
    </div>
  );
}
