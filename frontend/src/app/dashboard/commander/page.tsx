'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Activity, Users, Cloud } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import StatusChip from '@/components/StatusChip';
import { api } from '@/lib/api';

export default function CommanderDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, weatherData] = await Promise.all([
                api.getSystemStats(), // Using admin stats for now, ideally specific commander stats
                api.getCurrentWeather(),
            ]);
            setStats(statsData);
            setWeather(weatherData);
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

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">Commander Dashboard</h1>
                    <p className="text-secondary">Base readiness and strategic overview</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <DashboardCard
                        title="Base Readiness"
                        value="92%" // Placeholder or calculated
                        icon={<Shield className="w-5 h-5" />}
                    >
                        <div className="text-sm text-success">Operational</div>
                    </DashboardCard>

                    <DashboardCard
                        title="Active Personnel"
                        value={stats?.users?.total || 0}
                        icon={<Users className="w-5 h-5" />}
                    >
                        <div className="text-sm text-info">On duty</div>
                    </DashboardCard>

                    <DashboardCard
                        title="Weather Condition"
                        value={weather?.condition || 'Unknown'}
                        icon={<Cloud className="w-5 h-5" />}
                    >
                        <div className="text-sm text-secondary">
                            {weather?.temperature ? `${weather.temperature}°C` : 'N/A'}
                        </div>
                    </DashboardCard>

                    <DashboardCard
                        title="Emergencies"
                        value={0} // Need emergency count API
                        icon={<Activity className="w-5 h-5" />}
                    >
                        <div className="text-sm text-success">No active threats</div>
                    </DashboardCard>
                </div>

                {/* Weather Details */}
                {weather && (
                    <div className="bg-card rounded-lg border border-border p-6 mb-8">
                        <h2 className="text-xl font-semibold text-primary mb-4">Current Weather Conditions</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-secondary">Wind Speed</div>
                                <div className="text-lg font-medium">{weather.windSpeed} m/s</div>
                            </div>
                            <div>
                                <div className="text-sm text-secondary">Visibility</div>
                                <div className="text-lg font-medium">{weather.visibility / 1000} km</div>
                            </div>
                            <div>
                                <div className="text-sm text-secondary">Humidity</div>
                                <div className="text-lg font-medium">{weather.humidity}%</div>
                            </div>
                            <div>
                                <div className="text-sm text-secondary">Pressure</div>
                                <div className="text-lg font-medium">{weather.pressure} hPa</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
