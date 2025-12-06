import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { DataCard } from '../components/shared/DataCard';
import { Airplane, Wrench, Target, Siren } from '@phosphor-icons/react';
import { toast } from 'sonner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [weather, setWeather] = useState(null);
  const [runway, setRunway] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchWeather();
    fetchRunway();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/stats/dashboard');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load statistics');
    }
  };

  const fetchWeather = async () => {
    try {
      const response = await axios.get('/weather');
      setWeather(response.data);
    } catch (error) {
      console.error('Failed to load weather');
    }
  };

  const fetchRunway = async () => {
    try {
      const response = await axios.get('/runway-status');
      setRunway(response.data);
    } catch (error) {
      console.error('Failed to load runway status');
    }
  };

  return (
    <div className="space-y-6" data-testid="dashboard-overview">
      <div>
        <h3 className="text-2xl font-chivo font-bold uppercase tracking-wider mb-6">Operational Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DataCard title="Total Aircraft" value={stats?.total_aircraft || 0} icon={Airplane} />
          <DataCard title="Ready Aircraft" value={stats?.ready_aircraft || 0} icon={Airplane} />
          <DataCard title="Active Missions" value={stats?.active_missions || 0} icon={Target} />
          <DataCard title="Emergencies" value={stats?.active_emergencies || 0} icon={Siren} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-sm p-6">
          <h4 className="text-slate-500 text-xs uppercase tracking-wider font-mono mb-4">Weather Conditions</h4>
          {weather && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Temperature</span>
                <span className="text-lg font-mono font-bold">{weather.temperature}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Condition</span>
                <span className="text-lg font-mono font-bold">{weather.condition}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Wind Speed</span>
                <span className="text-lg font-mono font-bold">{weather.wind_speed} kt</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Visibility</span>
                <span className="text-lg font-mono font-bold">{weather.visibility} km</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-800/40 border border-slate-700/60 rounded-sm p-6">
          <h4 className="text-slate-500 text-xs uppercase tracking-wider font-mono mb-4">Runway Status</h4>
          {runway && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Runway 1</span>
                <span className="text-green-400 text-lg font-mono font-bold">{runway.runway_1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Runway 2</span>
                <span className="text-green-400 text-lg font-mono font-bold">{runway.runway_2}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;