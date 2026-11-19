import React from 'react';

export default function EmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-xl border border-border border-dashed">
      {Icon && (
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-surface mb-4">
          <Icon className="w-8 h-8 text-text-muted" />
        </div>
      )}
      <h3 className="text-lg font-medium text-text mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">{description}</p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
