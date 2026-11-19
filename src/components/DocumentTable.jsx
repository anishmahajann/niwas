import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function DocumentTable({ documents }) {
  if (!documents || Object.keys(documents).length === 0) {
    return <div className="text-text-muted text-sm italic p-4 bg-surface rounded-lg">No document information available.</div>;
  }

  const docs = Array.isArray(documents)
    ? documents.map((document, index) => ({
      id: `${document.name}-${index}`,
      name: document.name,
      status: document.status || 'not_provided',
    }))
    : Object.entries(documents).map(([key, value]) => ({
      id: key,
      name: value.name || key,
      status: value.status || 'not_provided',
    }));

  const checkedCount = docs.filter(d => d.status === 'reviewed' || d.status === 'verified').length;

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 bg-surface border-b border-border flex justify-between items-center">
        <h4 className="font-semibold text-text text-sm uppercase tracking-wider">Document Review</h4>
        <span className="text-xs font-medium bg-white px-2 py-1 rounded-md border border-border shadow-sm">
          {checkedCount} of {docs.length} Checked
        </span>
      </div>
      <table className="min-w-full divide-y divide-border">
        <tbody className="bg-white divide-y divide-border">
          {docs.map((doc) => {
            let statusEl;
            if (doc.status === 'reviewed' || doc.status === 'verified') {
              statusEl = <span className="flex items-center text-sm text-verified font-medium"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Reviewed</span>;
            } else if (doc.status === 'pending') {
              statusEl = <span className="flex items-center text-sm text-pending font-medium"><Clock className="w-4 h-4 mr-1.5" /> Pending</span>;
            } else {
              statusEl = <span className="flex items-center text-sm text-text-muted"><XCircle className="w-4 h-4 mr-1.5" /> Not Provided</span>;
            }

            return (
              <tr key={doc.id} className="hover:bg-surface/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text">
                  {doc.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  {statusEl}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="bg-surface px-4 py-3 border-t border-border flex items-start">
        <AlertCircle className="w-4 h-4 text-text-muted mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted">
          Document review by Niwas checks for apparent authenticity but does not constitute a legal title guarantee.
        </p>
      </div>
    </div>
  );
}
