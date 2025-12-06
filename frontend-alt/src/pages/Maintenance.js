import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Wrench } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/utils';

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const { user } = useAuth();
  const canManage = ['admin', 'technician'].includes(user?.role);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('/maintenance');
      setLogs(response.data);
    } catch (error) {
      toast.error('Failed to load maintenance logs');
    }
  };

  const updateStatus = async (logId, newStatus) => {
    try {
      await axios.patch(`/maintenance/${logId}/status?status=${newStatus}`);
      toast.success('Status updated');
      fetchLogs();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6" data-testid="maintenance-page">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-chivo font-bold uppercase tracking-wider">Maintenance Operations</h3>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-slate-800/40 border border-slate-700/60 rounded-sm p-6 hover:border-slate-500 transition-colors duration-200"
            data-testid="maintenance-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Wrench size={32} weight="duotone" className="text-yellow-400" />
                <div>
                  <h4 className="font-mono text-lg font-bold">{log.maintenance_type}</h4>
                  <p className="text-slate-400 text-sm">{formatDate(log.created_at)}</p>
                </div>
              </div>
              <StatusBadge status={log.status} />
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 uppercase text-xs tracking-wider font-mono block mb-1">
                  Description
                </span>
                <p className="text-slate-300 text-sm">{log.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 uppercase text-xs tracking-wider font-mono block mb-1">
                    Aircraft ID
                  </span>
                  <span className="font-mono text-slate-200 text-sm">
                    {log.aircraft_id.substring(0, 8)}...
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-xs tracking-wider font-mono block mb-1">
                    Technician ID
                  </span>
                  <span className="font-mono text-slate-200 text-sm">
                    {log.technician_id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            {canManage && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <label className="block text-xs text-slate-500 uppercase tracking-wider font-mono mb-2">
                  Update Status
                </label>
                <select
                  onChange={(e) => updateStatus(log.id, e.target.value)}
                  value={log.status}
                  className="w-full bg-slate-950 border-slate-700 text-slate-100 rounded-sm text-sm px-3 py-2 border outline-none focus:border-blue-500"
                  data-testid="maintenance-status-select"
                >
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>
            )}
          </div>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Wrench size={48} weight="duotone" className="mx-auto mb-4 opacity-50" />
            <p>No maintenance logs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;