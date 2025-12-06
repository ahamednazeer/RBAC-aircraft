import React from 'react';
import { cn, getStatusColor } from '../../lib/utils';

export const StatusBadge = ({ status }) => {
  return (
    <span
      className={cn(
        'font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border',
        getStatusColor(status)
      )}
      data-testid={`status-badge-${status.toLowerCase()}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
};