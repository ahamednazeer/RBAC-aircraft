'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { Plane, Search, Wrench, AlertTriangle } from 'lucide-react';

export default function AircraftManagementPage() {
    const [aircraft, setAircraft] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAircraft = async () => {
        try {
            const data = await api.getAircraft();
            setAircraft(data);
        } catch (error) {
            console.error('Failed to fetch aircraft:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAircraft();
    }, []);

    const filteredAircraft = aircraft.filter(ac =>
        ac.tailNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ac.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ac.squadron.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            key: 'tailNumber',
            label: 'Tail Number',
            render: (ac: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-500">
                        <Plane className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-200">{ac.tailNumber}</div>
                        <div className="text-xs text-slate-500">{ac.type}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (ac: any) => <StatusChip status={ac.status} size="sm" />
        },
        {
            key: 'squadron',
            label: 'Squadron',
            render: (ac: any) => <span className="text-slate-400">{ac.squadron}</span>
        },
        {
            key: 'location',
            label: 'Location',
            render: (ac: any) => <span className="text-slate-400">{ac.location}</span>
        },
        {
            key: 'maintenance',
            label: 'Maintenance',
            render: (ac: any) => (
                <div className="text-xs">
                    <div className="text-slate-400">Last: {new Date(ac.lastMaintenance).toLocaleDateString()}</div>
                    <div className={`mt-0.5 ${new Date(ac.nextMaintenance) < new Date() ? 'text-red-400 font-medium' : 'text-slate-500'
                        }`}>
                        Next: {new Date(ac.nextMaintenance).toLocaleDateString()}
                    </div>
                </div>
            )
        },
        {
            key: 'flightHours',
            label: 'Flight Hours',
            render: (ac: any) => <span className="font-mono text-slate-300">{ac.flightHours.toFixed(1)}</span>
        }
    ];

    if (loading) return <div className="text-slate-400">Loading fleet data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Aircraft Fleet</h1>
                    <p className="text-slate-400 mt-2">Monitor and manage fleet status and maintenance</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">
                        <Wrench className="w-4 h-4" />
                        Maintenance Schedule
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
                        <Plus className="w-4 h-4" />
                        Add Aircraft
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Plane className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-100">{aircraft.filter(a => a.status === 'READY').length}</div>
                        <div className="text-sm text-slate-500">Ready for Flight</div>
                    </div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                        <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-100">{aircraft.filter(a => a.status === 'IN_MAINTENANCE').length}</div>
                        <div className="text-sm text-slate-500">In Maintenance</div>
                    </div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-100">{aircraft.filter(a => a.status === 'GROUNDED').length}</div>
                        <div className="text-sm text-slate-500">Grounded</div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <Search className="w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search fleet by tail number, type, or squadron..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-slate-200 w-full placeholder-slate-500"
                />
            </div>

            <DataTable
                data={filteredAircraft}
                columns={columns}
                emptyMessage="No aircraft found."
            />
        </div>
    );
}

// Import Plus icon locally since it was missing in imports
import { Plus } from 'lucide-react';
