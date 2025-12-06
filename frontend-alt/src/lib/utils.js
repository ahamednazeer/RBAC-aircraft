import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const colors = {
    READY: 'text-green-400 border-green-800 bg-green-950/50',
    GROUNDED: 'text-red-400 border-red-800 bg-red-950/50',
    IN_MAINTENANCE: 'text-yellow-400 border-yellow-800 bg-yellow-950/50',
    PLANNED: 'text-blue-400 border-blue-800 bg-blue-950/50',
    ACTIVE: 'text-red-400 border-red-800 bg-red-950/50',
    DISPATCHED: 'text-orange-400 border-orange-800 bg-orange-950/50',
    COMPLETED: 'text-green-400 border-green-800 bg-green-950/50',
    CLOSED: 'text-slate-400 border-slate-700 bg-slate-900/50',
    IN_PROGRESS: 'text-yellow-400 border-yellow-800 bg-yellow-950/50',
  };
  return colors[status] || 'text-slate-400 border-slate-700 bg-slate-900/50';
};