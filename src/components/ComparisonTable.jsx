import React from 'react';
import { Link } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { formatPrice, formatArea } from '../utils/formatters';
import { getFreshnessStatus } from '../utils/verification';

export default function ComparisonTable({ properties, onRemove }) {
  if (!properties || properties.length === 0) return null;

  return (
    <div className="overflow-x-auto border border-border rounded-xl bg-white shadow-sm">
      <table className="w-full text-left border-collapse min-w-max">
        <thead>
          <tr>
            <th className="p-4 border-b border-r border-border bg-surface w-48 sticky left-0 z-10">
              <span className="font-semibold text-text uppercase tracking-wider text-sm">Features</span>
            </th>
            {properties.map((p) => (
              <th key={p.id} className="p-4 border-b border-border min-w-[250px] relative">
                <button 
                  onClick={() => onRemove(p.id)}
                  className="absolute top-2 right-2 p-1 rounded-full text-text-muted hover:bg-surface hover:text-failed transition-colors"
                  title="Remove from comparison"
                >
                  <X className="w-4 h-4" />
                </button>
                <Link to={`/property/${p.id}`} className="block mt-4 hover:opacity-80 transition-opacity">
                  <img src={p.images[0]} alt={p.title} className="w-full h-32 object-cover rounded-md mb-2" />
                  <h3 className="font-bold text-text truncate" title={p.title}>{p.title}</h3>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-4 border-b border-r border-border bg-surface sticky left-0 z-10 font-medium text-text">Price</td>
            {properties.map(p => (
              <td key={p.id} className="p-4 border-b border-border font-bold text-primary text-lg">
                {formatPrice(p.price)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4 border-b border-r border-border bg-surface sticky left-0 z-10 font-medium text-text">Type & Size</td>
            {properties.map(p => (
              <td key={p.id} className="p-4 border-b border-border text-text">
                {p.propertyType}{p.bedrooms ? ` • ${p.bedrooms} BHK` : ''} • {formatArea(p.area)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4 border-b border-r border-border bg-surface sticky left-0 z-10 font-medium text-text">Location</td>
            {properties.map(p => (
              <td key={p.id} className="p-4 border-b border-border text-text">
                {p.locality}, {p.city}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4 border-b border-r border-border bg-surface sticky left-0 z-10 font-medium text-text">Trust Score</td>
            {properties.map(p => {
              const score = p.trustScore?.total || 0;
              let scoreColor = 'text-failed font-bold';
              if (score >= 80) scoreColor = 'text-verified font-bold';
              else if (score >= 60) scoreColor = 'text-accent font-bold';
              else if (score >= 40) scoreColor = 'text-pending font-bold';
              
              return (
                <td key={p.id} className={`p-4 border-b border-border text-xl ${scoreColor}`}>
                  {score}/100
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="p-4 border-b border-r border-border bg-surface sticky left-0 z-10 font-medium text-text">Verification</td>
            {properties.map(p => {
              const freshness = p.lastVerifiedAt ? getFreshnessStatus(p.lastVerifiedAt) : null;
              return (
                <td key={p.id} className="p-4 border-b border-border text-sm">
                  {freshness ? (
                    <span className={`inline-flex items-center ${freshness.color} ${freshness.bgColor} px-2 py-1 rounded font-medium`}>
                      <Check className="w-3 h-3 mr-1" /> {freshness.label}
                    </span>
                  ) : (
                    <span className="text-text-muted">Not recently verified</span>
                  )}
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="p-4 border-b border-r border-border bg-surface sticky left-0 z-10 font-medium text-text">Documents Checked</td>
            {properties.map((p) => {
              const { checked = 0, total = 0 } = p.verification?.documentsReviewed || {};
              return (
                <td key={p.id} className="p-4 border-b border-border text-sm text-text">
                  {checked} of {total}
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="p-4 border-b border-r border-border bg-surface sticky left-0 z-10 font-medium text-text">Availability</td>
            {properties.map(p => (
              <td key={p.id} className="p-4 border-b border-border text-sm capitalize text-text">
                {p.availabilityStatus}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4 border-b border-r border-border bg-surface sticky left-0 z-10 font-medium text-text">Amenities</td>
            {properties.map(p => (
              <td key={p.id} className="p-4 border-b border-border text-sm text-text">
                {p.amenities?.join(', ') || 'Not listed'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
