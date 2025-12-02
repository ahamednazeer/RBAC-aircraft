'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardCard from '@/components/DashboardCard';
import { Users, Plane, FileText, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getSystemStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-slate-400">Loading system statistics...</div>;
    }

    if (!stats) {
        return <div className="text-red-400">Failed to load statistics.</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-100">System Overview</h1>
                <p className="text-slate-400 mt-2">Real-time system metrics and status</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    title="Total Users"
                    value={stats.users.total}
                    icon={<Users className="w-5 h-5" />}
                    change={{ value: stats.users.active, label: 'Active Users' }}
                />
                <DashboardCard
                    title="Fleet Status"
                    value={stats.aircraft.total}
                    icon={<Plane className="w-5 h-5" />}
                    change={{ value: stats.aircraft.ready, label: 'Ready for Flight' }}
                />
                <DashboardCard
                    title="Documents"
                    value={stats.documents.total}
                    icon={<FileText className="w-5 h-5" />}
                />
                <DashboardCard
                    title="Active Emergencies"
                    value={stats.emergencies.active}
                    icon={<AlertTriangle className="w-5 h-5" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">User Distribution</h3>
                    <div className="space-y-4">
                        {Object.entries(stats.users.byRole).map(([role, count]: [string, any]) => (
                            <div key={role} className="flex items-center justify-between">
                                <span className="text-slate-400 capitalize">{role.toLowerCase()}</span>
                                <span className="text-slate-200 font-mono">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Aircraft Status</h3>
                    <div className="space-y-4">
                        {Object.entries(stats.aircraft.byStatus).map(([status, count]: [string, any]) => (
                            <div key={status} className="flex items-center justify-between">
                                <span className="text-slate-400 capitalize">{status.replace('_', ' ').toLowerCase()}</span>
                                <span className="text-slate-200 font-mono">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
