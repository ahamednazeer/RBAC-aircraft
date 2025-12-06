import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Siren, Plus } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/utils';

const Emergencies = () => {
  const [emergencies, setEmergencies] = useState([]);
  const { user } = useAuth();
  const canManage = ['admin', 'emergency', 'commander'].includes(user?.role);

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      const response = await axios.get('/emergencies');
      setEmergencies(response.data);
    } catch (error) {
      toast.error('Failed to load emergencies');
    }
  };

  const updateStatus = async (emergencyId, newStatus) => {
    try {
      await axios.patch(`/emergencies/${emergencyId}/status?status=${newStatus}`);
      toast.success('Emergency status updated');
      fetchEmergencies();
    } catch (error) {
      toast.error('Failed to update emergency');
    }
  };

  return (
    <div className="space-y-6" data-testid="emergencies-page">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-chivo font-bold uppercase tracking-wider">Emergency Management</h3>
      </div>

      <div className="space-y-4">
        {emergencies.map((emergency) => (
          <div
            key={emergency.id}
            className="bg-slate-800/40 border border-slate-700/60 rounded-sm p-6 hover:border-slate-500 transition-colors duration-200"
            data-testid="emergency-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Siren size={32} weight="duotone" className="text-red-400" />
                <div>
                  <h4 className="font-mono text-lg font-bold text-red-400">{emergency.type}</h4>
                  <p className="text-slate-400 text-sm">{formatDate(emergency.created_at)}</p>
                </div>
              </div>
              <StatusBadge status={emergency.status} />
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 uppercase text-xs tracking-wider font-mono block mb-1">
                  Location
                </span>
                <span className="font-mono text-slate-200">{emergency.location}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-xs tracking-wider font-mono block mb-1">
                  Description
                </span>
                <p className="text-slate-300 text-sm">{emergency.description}</p>
              </div>
            </div>

            {canManage && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <label className="block text-xs text-slate-500 uppercase tracking-wider font-mono mb-2">
                  Update Status
                </label>
                <select
                  onChange={(e) => updateStatus(emergency.id, e.target.value)}
                  value={emergency.status}
                  className="w-full bg-slate-950 border-slate-700 text-slate-100 rounded-sm text-sm px-3 py-2 border outline-none focus:border-blue-500"
                  data-testid="emergency-status-select"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DISPATCHED">DISPATCHED</option>
                  <option value="ARRIVED">ARRIVED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            )}
          </div>
        ))}

        {emergencies.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Siren size={48} weight="duotone" className="mx-auto mb-4 opacity-50" />
            <p>No active emergencies</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Emergencies;