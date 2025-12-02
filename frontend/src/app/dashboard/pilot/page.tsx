'use client';

import React, { useEffect, useState } from 'react';
import { Plane, Wrench, AlertTriangle, TrendingUp } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { api } from '@/lib/api';
import { Aircraft } from '@/types';

export default function PilotDashboard() {
    const [aircraft, setAircraft] = useState<Aircraft[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [aircraftData, statsData] = await Promise.all([
                api.getAircraft(),
                api.getAircraftStats(),
            ]);
            setAircraft(aircraftData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-secondary">Loading...</div>
            </div>
        );
    }

    const readyAircraft = aircraft.filter(a => a.status === 'READY');

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">Pilot Dashboard</h1>
                    <p className="text-secondary">Aircraft readiness and operational status</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <DashboardCard
                        title="Aircraft Ready"
                        value={stats?.ready || 0}
                        icon={<Plane className="w-5 h-5" />}
                        change={{ value: 2, label: 'since yesterday' }}
                    >
                        <div className="text-sm text-success">
                            {stats?.readyPercentage || 0}% of fleet
                        </div>
                    </DashboardCard>

                    <DashboardCard
                        title="In Maintenance"
                        value={stats?.inMaintenance || 0}
                        icon={<Wrench className="w-5 h-5" />}
                    >
                        <div className="text-sm text-warning">
                            Scheduled maintenance
                        </div>
                    </DashboardCard>

                    <DashboardCard
                        title="Grounded"
                        value={stats?.grounded || 0}
                        icon={<AlertTriangle className="w-5 h-5" />}
                    >
                        <div className="text-sm text-critical">
                            Requires attention
                        </div>
                    </DashboardCard>

                    <DashboardCard
                        title="Total Fleet"
                        value={stats?.total || 0}
                        icon={<TrendingUp className="w-5 h-5" />}
                    >
                        <div className="text-sm text-info">
                            Operational aircraft
                        </div>
                    </DashboardCard>
                </div>

                {/* Ready Aircraft Table */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">Ready for Flight</h2>
                    <DataTable
                        data={readyAircraft}
                        columns={[
                            { key: 'tailNumber', label: 'Tail Number', sortable: true },
                            { key: 'type', label: 'Aircraft Type' },
                            { key: 'squadron', label: 'Squadron' },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (item) => <StatusChip status={item.status} size="sm" />,
                            },
                            {
                                key: 'fuelLevel',
                                label: 'Fuel',
                                render: (item) => (
                                    <span className={item.fuelLevel && item.fuelLevel > 80 ? 'text-success' : 'text-warning'}>
                                        {item.fuelLevel?.toFixed(1)}%
                                    </span>
                                ),
                            },
                            { key: 'location', label: 'Location' },
                        ]}
                        emptyMessage="No aircraft ready for flight"
                    />
                </div>

                {/* All Aircraft Table */}
                <div>
                    <h2 className="text-xl font-semibold text-primary mb-4">All Aircraft</h2>
                    <DataTable
                        data={aircraft}
                        columns={[
                            { key: 'tailNumber', label: 'Tail Number', sortable: true },
                            { key: 'type', label: 'Aircraft Type' },
                            { key: 'model', label: 'Model' },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (item) => <StatusChip status={item.status} size="sm" />,
                            },
                            {
                                key: 'flightHours',
                                label: 'Flight Hours',
                                render: (item) => <span>{item.flightHours.toFixed(1)} hrs</span>,
                            },
                            { key: 'location', label: 'Location' },
                        ]}
                        emptyMessage="No aircraft available"
                    />
                </div>
            </div>
        </div>
    );
}
