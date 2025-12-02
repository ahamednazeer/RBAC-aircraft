import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardCardProps {
    title: string;
    value: string | number;
    change?: {
        value: number;
        label: string;
    };
    icon?: ReactNode;
    children?: ReactNode;
    className?: string;
}

export default function DashboardCard({
    title,
    value,
    change,
    icon,
    children,
    className = '',
}: DashboardCardProps) {
    return (
        <div className={`card hover:bg-surface-elevated transition-colors ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-secondary text-sm font-medium uppercase tracking-wide">
                    {title}
                </h3>
                {icon && <div className="text-secondary">{icon}</div>}
            </div>

            <div className="mb-2">
                <div className="text-4xl font-semibold text-primary">{value}</div>
            </div>

            {change && (
                <div className="flex items-center gap-1 text-sm">
                    {change.value > 0 ? (
                        <>
                            <TrendingUp className="w-4 h-4 text-success" />
                            <span className="text-success">+{change.value}</span>
                        </>
                    ) : change.value < 0 ? (
                        <>
                            <TrendingDown className="w-4 h-4 text-critical" />
                            <span className="text-critical">{change.value}</span>
                        </>
                    ) : null}
                    <span className="text-muted">{change.label}</span>
                </div>
            )}

            {children && <div className="mt-4 pt-4 border-t border-border">{children}</div>}
        </div>
    );
}
