'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Users, Plane, Plus } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { api } from '@/lib/api';

import CreateMissionModal from '@/components/CreateMissionModal';

export default function OpsDashboard() {
    const [missions, setMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const missionsData = await api.getMissions();
            setMissions(missionsData);
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

    const plannedMissions = missions.filter(m => m.status === 'PLANNED');
    const activeMissions = missions.filter(m => m.status === 'IN_PROGRESS');

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-2">Operations Dashboard</h1>
                        <p className="text-secondary">Mission planning and flight schedules</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        <Plus className="w-4 h-4" />
                        New Mission
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <DashboardCard
                        title="Planned Missions"
                        value={plannedMissions.length}
                        icon={<Calendar className="w-5 h-5" />}
                    >
                        <div className="text-sm text-info">Upcoming flights</div>
                    </DashboardCard>

                    <DashboardCard
                        title="Active Missions"
                        value={activeMissions.length}
                        icon={<Plane className="w-5 h-5" />}
                    >
                        <div className="text-sm text-success">Currently in air</div>
                    </DashboardCard>

                    <DashboardCard
                        title="Total Missions Today"
                        value={missions.length} // Simplified
                        icon={<Users className="w-5 h-5" />}
                    >
                        <div className="text-sm text-secondary">Daily volume</div>
                    </DashboardCard>
                </div>

                {/* Missions Table */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">Mission Schedule</h2>
                    <DataTable
                        data={missions}
                        columns={[
                            { key: 'title', label: 'Mission Name' },
                            { key: 'type', label: 'Type' },
                            {
                                key: 'aircraft',
                                label: 'Aircraft',
                                render: (item) => item.aircraft?.tailNumber || 'Unassigned'
                            },
                            {
                                key: 'pilot',
                                label: 'Pilot',
                                render: (item) => item.pilot ? `${item.pilot.firstName} ${item.pilot.lastName}` : 'Unassigned'
                            },
                            {
                                key: 'startTime',
                                label: 'Start Time',
                                render: (item) => new Date(item.startTime).toLocaleString(),
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (item) => <StatusChip status={item.status} size="sm" />,
                            },
                        ]}
                        emptyMessage="No missions scheduled"
                    />
                </div>

                {showCreateModal && (
                    <CreateMissionModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={loadData}
                    />
                )}
            </div>
        </div>
    );
}
