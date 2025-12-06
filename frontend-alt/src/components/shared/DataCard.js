import React from 'react';
import { cn } from '../../lib/utils';

export const DataCard = ({ title, value, icon: Icon, className }) => {
  return (
    <div
      className={cn(
        'bg-slate-800/40 border border-slate-700/60 rounded-sm p-4 relative overflow-hidden hover:border-slate-500 transition-colors duration-200',
        className
      )}
      data-testid="data-card"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider font-mono mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold font-mono text-slate-100">{value}</p>
        </div>
        {Icon && <Icon className="text-slate-600" size={48} weight="duotone" />}
      </div>
    </div>
  );
};