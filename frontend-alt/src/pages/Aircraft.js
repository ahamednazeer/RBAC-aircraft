import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Airplane, Plus } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const Aircraft = () => {
  const [aircraft, setAircraft] = useState([]);
  const { user } = useAuth();
  const canEdit = ['admin', 'ops_officer', 'technician'].includes(user?.role);

  useEffect(() => {
    fetchAircraft();
  }, []);

  const fetchAircraft = async () => {
    try {
      const response = await axios.get('/aircraft');
      setAircraft(response.data);
    } catch (error) {
      toast.error('Failed to load aircraft');
    }
  };

  const updateStatus = async (aircraftId, newStatus) => {
    try {
      await axios.patch(`/aircraft/${aircraftId}/status?status=${newStatus}`);
      toast.success('Status updated');
      fetchAircraft();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6" data-testid="aircraft-page">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-chivo font-bold uppercase tracking-wider">Aircraft Fleet</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {aircraft.map((craft) => (
          <div
            key={craft.id}
            className="bg-slate-800/40 border border-slate-700/60 rounded-sm p-6 hover:border-slate-500 transition-colors duration-200"
            data-testid="aircraft-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Airplane size={32} weight="duotone" className="text-blue-400" />
                <div>
                  <h4 className="font-mono text-xl font-bold">{craft.tail_number}</h4>
                  <p className="text-slate-400 text-sm">{craft.aircraft_type}</p>
                </div>
              </div>
              <StatusBadge status={craft.status} />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase text-xs tracking-wider font-mono">Squadron</span>
                <span className="font-mono">{craft.squadron}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase text-xs tracking-wider font-mono">Base</span>
                <span className="font-mono">{craft.base}</span>
              </div>
            </div>

            {canEdit && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <label className="block text-xs text-slate-500 uppercase tracking-wider font-mono mb-2">
                  Update Status
                </label>
                <select
                  onChange={(e) => updateStatus(craft.id, e.target.value)}
                  value={craft.status}
                  className="w-full bg-slate-950 border-slate-700 text-slate-100 rounded-sm text-sm px-3 py-2 border outline-none focus:border-blue-500"
                  data-testid="status-select"
                >
                  <option value="READY">READY</option>
                  <option value="IN_MAINTENANCE">IN MAINTENANCE</option>
                  <option value="GROUNDED">GROUNDED</option>
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Aircraft;