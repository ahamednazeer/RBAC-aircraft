import React from 'react';
import { AircraftStatus, MaintenanceStatus, EmergencyStatus } from '@/types';

type StatusVariant =
    | AircraftStatus
    | MaintenanceStatus
    | EmergencyStatus
    | 'CRITICAL'
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW';

interface StatusChipProps {
    status: StatusVariant;
    size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<string, { bg: string; text: string; label?: string }> = {
    // Aircraft statuses
    READY: { bg: 'bg-success/20', text: 'text-success' },
    IN_MAINTENANCE: { bg: 'bg-warning/20', text: 'text-warning' },
    GROUNDED: { bg: 'bg-critical/20', text: 'text-critical' },
    IN_FLIGHT: { bg: 'bg-info/20', text: 'text-info' },

    // Maintenance statuses
    PENDING: { bg: 'bg-warning/20', text: 'text-warning' },
    IN_PROGRESS: { bg: 'bg-info/20', text: 'text-info' },
    COMPLETED: { bg: 'bg-success/20', text: 'text-success' },
    CANCELLED: { bg: 'bg-text-muted/20', text: 'text-muted' },

    // Emergency statuses
    ACTIVE: { bg: 'bg-critical/20', text: 'text-critical' },
    RESOLVING: { bg: 'bg-warning/20', text: 'text-warning' },

    // Priority levels
    CRITICAL: { bg: 'bg-critical/20', text: 'text-critical' },
    HIGH: { bg: 'bg-warning/20', text: 'text-warning' },
    MEDIUM: { bg: 'bg-info/20', text: 'text-info' },
    LOW: { bg: 'bg-text-muted/20', text: 'text-muted' },
};

const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
};

export default function StatusChip({ status, size = 'md' }: StatusChipProps) {
    const config = statusConfig[status] || { bg: 'bg-text-muted/20', text: 'text-muted' };
    const label = config.label || status.replace(/_/g, ' ');

    return (
        <span
            className={`
        inline-flex items-center justify-center
        rounded-full font-medium uppercase tracking-wide
        ${config.bg} ${config.text} ${sizeClasses[size]}
      `}
        >
            {label}
        </span>
    );
}
