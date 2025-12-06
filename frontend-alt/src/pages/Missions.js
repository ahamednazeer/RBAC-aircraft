import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Target, Plus, Airplane } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/utils';

const Missions = () => {
  const [missions, setMissions] = useState([]);
  const { user } = useAuth();
  const canCreate = ['admin', 'ops_officer'].includes(user?.role);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await axios.get('/missions');
      setMissions(response.data);
    } catch (error) {
      toast.error('Failed to load missions');
    }
  };

  const updateStatus = async (missionId, newStatus) => {
    try {
      await axios.patch(`/missions/${missionId}/status?status=${newStatus}`);
      toast.success('Mission status updated');
      fetchMissions();
    } catch (error) {
      toast.error('Failed to update mission');
    }
  };

  return (
    <div className="space-y-6" data-testid="missions-page">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-chivo font-bold uppercase tracking-wider">Mission Planning</h3>
      </div>

      <div className="space-y-4">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className="bg-slate-800/40 border border-slate-700/60 rounded-sm p-6 hover:border-slate-500 transition-colors duration-200"
            data-testid="mission-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Target size={32} weight="duotone" className="text-blue-400" />
                <div>
                  <h4 className="font-mono text-lg font-bold">{mission.mission_type}</h4>
                  <p className="text-slate-400 text-sm">{formatDate(mission.scheduled_time)}</p>
                </div>
              </div>
              <StatusBadge status={mission.status} />
            </div>

            {mission.description && (
              <p className="text-slate-300 text-sm mb-4">{mission.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 uppercase text-xs tracking-wider font-mono block mb-1">
                  Aircraft ID
                </span>
                <span className="font-mono text-slate-200">{mission.aircraft_id.substring(0, 8)}...</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-xs tracking-wider font-mono block mb-1">
                  Pilot ID
                </span>
                <span className="font-mono text-slate-200">{mission.pilot_id.substring(0, 8)}...</span>
              </div>
            </div>

            {canCreate && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <label className="block text-xs text-slate-500 uppercase tracking-wider font-mono mb-2">
                  Update Status
                </label>
                <select
                  onChange={(e) => updateStatus(mission.id, e.target.value)}
                  value={mission.status}
                  className="w-full bg-slate-950 border-slate-700 text-slate-100 rounded-sm text-sm px-3 py-2 border outline-none focus:border-blue-500"
                  data-testid="mission-status-select"
                >
                  <option value="PLANNED">PLANNED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            )}
          </div>
        ))}

        {missions.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Target size={48} weight="duotone" className="mx-auto mb-4 opacity-50" />
            <p>No missions scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Missions;