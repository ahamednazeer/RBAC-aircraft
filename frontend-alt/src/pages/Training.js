import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { GraduationCap, BookOpen } from '@phosphor-icons/react';
import { toast } from 'sonner';

const Training = () => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await axios.get('/training');
      setModules(response.data);
    } catch (error) {
      toast.error('Failed to load training modules');
    }
  };

  return (
    <div className="space-y-6" data-testid="training-page">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-chivo font-bold uppercase tracking-wider">Training Center</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {modules.map((module) => (
          <div
            key={module.id}
            className="bg-slate-800/40 border border-slate-700/60 rounded-sm p-6 hover:border-slate-500 transition-colors duration-200 cursor-pointer"
            onClick={() => setSelectedModule(module)}
            data-testid="training-module-card"
          >
            <div className="flex items-start gap-3 mb-4">
              <GraduationCap size={32} weight="duotone" className="text-blue-400" />
              <div>
                <h4 className="font-mono text-lg font-bold">{module.title}</h4>
                <p className="text-slate-400 text-sm mt-1">{module.description}</p>
              </div>
            </div>
            <button className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-2">
              <BookOpen size={16} />
              View Module
            </button>
          </div>
        ))}
      </div>

      {selectedModule && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedModule(null)}>
          <div
            className="bg-slate-900 border border-slate-700 rounded-sm p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-chivo font-bold mb-4">{selectedModule.title}</h3>
            <p className="text-slate-400 mb-6">{selectedModule.description}</p>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300">{selectedModule.content}</p>
            </div>
            <button
              onClick={() => setSelectedModule(null)}
              className="mt-6 bg-blue-600 hover:bg-blue-500 text-white rounded-sm px-6 py-2 text-sm uppercase tracking-wide"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {modules.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <GraduationCap size={48} weight="duotone" className="mx-auto mb-4 opacity-50" />
          <p>No training modules available</p>
        </div>
      )}
    </div>
  );
};

export default Training;