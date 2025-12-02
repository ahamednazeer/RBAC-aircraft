'use client';

import React, { useEffect, useState } from 'react';
import { Wrench, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { api } from '@/lib/api';
import { Aircraft } from '@/types';

export default function TechnicianDashboard() {
    const [aircraft, setAircraft] = useState<Aircraft[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [aircraftData, logsData] = await Promise.all([
                api.getAircraft(),
                api.getMaintenanceLogs(),
            ]);
            setAircraft(aircraftData);
            setLogs(logsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.updateAircraft(id, { status });
            loadData(); // Refresh data
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-secondary">Loading...</div>
            </div>
        );
    }

    const maintenanceAircraft = aircraft.filter(a => a.status === 'IN_MAINTENANCE');
    const groundedAircraft = aircraft.filter(a => a.status === 'GROUNDED');

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">Technician Dashboard</h1>
                    <p className="text-secondary">Maintenance operations and aircraft health</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <DashboardCard
                        title="In Maintenance"
                        value={maintenanceAircraft.length}
                        icon={<Wrench className="w-5 h-5" />}
                    >
                        <div className="text-sm text-warning">Active work orders</div>
                    </DashboardCard>

                    <DashboardCard
                        title="Grounded"
                        value={groundedAircraft.length}
                        icon={<AlertTriangle className="w-5 h-5" />}
                    >
                        <div className="text-sm text-critical">Critical issues</div>
                    </DashboardCard>

                    <DashboardCard
                        title="Pending Logs"
                        value={logs.filter(l => l.status === 'PENDING').length}
                        icon={<Clock className="w-5 h-5" />}
                    >
                        <div className="text-sm text-info">Awaiting action</div>
                    </DashboardCard>
                </div>

                {/* Aircraft Status Table */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">Fleet Maintenance Status</h2>
                    <DataTable
                        data={aircraft}
                        columns={[
                            { key: 'tailNumber', label: 'Tail Number', sortable: true },
                            { key: 'type', label: 'Type' },
                            {
                                key: 'status',
                                label: 'Current Status',
                                render: (item) => <StatusChip status={item.status} size="sm" />,
                            },
                            {
                                key: 'actions',
                                label: 'Actions',
                                render: (item) => (
                                    <div className="flex gap-2">
                                        {item.status !== 'READY' && (
                                            <button
                                                onClick={() => handleStatusUpdate(item.id, 'READY')}
                                                className="px-2 py-1 text-xs bg-success/10 text-success rounded hover:bg-success/20"
                                            >
                                                Mark Ready
                                            </button>
                                        )}
                                        {item.status !== 'IN_MAINTENANCE' && (
                                            <button
                                                onClick={() => handleStatusUpdate(item.id, 'IN_MAINTENANCE')}
                                                className="px-2 py-1 text-xs bg-warning/10 text-warning rounded hover:bg-warning/20"
                                            >
                                                Start Maint.
                                            </button>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        emptyMessage="No aircraft found"
                    />
                </div>

                {/* Recent Logs */}
                <div>
                    <h2 className="text-xl font-semibold text-primary mb-4">Recent Maintenance Logs</h2>
                    <DataTable
                        data={logs.slice(0, 5)} // Show only recent 5
                        columns={[
                            { key: 'aircraft.tailNumber', label: 'Aircraft', render: (item) => item.aircraft?.tailNumber || 'N/A' },
                            { key: 'taskType', label: 'Task' },
                            { key: 'description', label: 'Description' },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (item) => <StatusChip status={item.status} size="sm" />,
                            },
                            {
                                key: 'createdAt',
                                label: 'Date',
                                render: (item) => new Date(item.createdAt).toLocaleDateString(),
                            },
                        ]}
                        emptyMessage="No logs found"
                    />
                </div>
            </div>
        </div>
    );
}
