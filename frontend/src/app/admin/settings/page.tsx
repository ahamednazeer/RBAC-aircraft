'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Save, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface SystemSettings {
    baseName: string;
    timezone: string;
    modules: {
        maintenance: boolean;
        emergency: boolean;
        training: boolean;
        family: boolean;
        fatigue: boolean;
    };
}

export default function SystemSettingsPage() {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchSettings = async () => {
        try {
            const data = await api.getSystemSettings();
            // Ensure defaults if data is missing properties
            setSettings({
                baseName: data.baseName || '',
                timezone: data.timezone || 'UTC',
                modules: {
                    maintenance: data.modules?.maintenance ?? true,
                    emergency: data.modules?.emergency ?? true,
                    training: data.modules?.training ?? true,
                    family: data.modules?.family ?? true,
                    fatigue: data.modules?.fatigue ?? true,
                }
            });
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            setMessage({ type: 'error', text: 'Failed to load system settings' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        setMessage(null);

        try {
            await api.updateSystemSettings(settings);
            setMessage({ type: 'success', text: 'Settings saved successfully' });
        } catch (error) {
            console.error('Failed to save settings:', error);
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!confirm('Are you sure you want to reset all settings to default values? This cannot be undone.')) return;

        setLoading(true);
        setMessage(null);

        try {
            await api.resetSystemSettings();
            await fetchSettings();
            setMessage({ type: 'success', text: 'Settings reset to defaults' });
        } catch (error) {
            console.error('Failed to reset settings:', error);
            setMessage({ type: 'error', text: 'Failed to reset settings' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-slate-400">Loading settings...</div>;
    }

    if (!settings) {
        return <div className="text-red-400">Failed to load settings.</div>;
    }

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">System Settings</h1>
                    <p className="text-slate-400 mt-2">Configure global system parameters and modules</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset Defaults
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </button>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="space-y-6">
                {/* General Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                        General Configuration
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Base Name</label>
                            <input
                                type="text"
                                value={settings.baseName}
                                onChange={(e) => setSettings({ ...settings, baseName: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                placeholder="e.g. AeroOps Airbase"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Timezone</label>
                            <select
                                value={settings.timezone}
                                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            >
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">Eastern Time (US & Canada)</option>
                                <option value="America/Chicago">Central Time (US & Canada)</option>
                                <option value="America/Denver">Mountain Time (US & Canada)</option>
                                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                <option value="Europe/London">London</option>
                                <option value="Asia/Tokyo">Tokyo</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Module Configuration */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full" />
                        System Modules
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(settings.modules).map(([key, enabled]) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                                <div>
                                    <div className="font-medium text-slate-200 capitalize">{key} Module</div>
                                    <div className="text-xs text-slate-500 mt-1">Enable or disable {key} functionality</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={enabled}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            modules: { ...settings.modules, [key]: e.target.checked }
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
