import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { House, Phone, MapPin } from '@phosphor-icons/react';
import { toast } from 'sonner';

const Welfare = () => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get('/welfare');
      setResources(response.data);
    } catch (error) {
      toast.error('Failed to load welfare resources');
    }
  };

  const categories = [...new Set(resources.map((r) => r.category))];

  return (
    <div className="space-y-6" data-testid="welfare-page">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-chivo font-bold uppercase tracking-wider">Family Welfare Portal</h3>
      </div>

      <p className="text-slate-400">
        Welcome to the Family Welfare Portal. Here you'll find resources and support services available to
        military families.
      </p>

      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h4 className="text-xl font-chivo font-bold uppercase tracking-wider text-blue-400">{category}</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {resources
              .filter((r) => r.category === category)
              .map((resource) => (
                <div
                  key={resource.id}
                  className="bg-slate-800/40 border border-slate-700/60 rounded-sm p-6 hover:border-slate-500 transition-colors duration-200"
                  data-testid="welfare-card"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <House size={32} weight="duotone" className="text-blue-400" />
                    <div>
                      <h5 className="font-mono text-lg font-bold">{resource.title}</h5>
                      <p className="text-slate-400 text-sm mt-1">{resource.description}</p>
                    </div>
                  </div>
                  {resource.contact_info && (
                    <div className="flex items-center gap-2 text-sm text-slate-300 mt-4 pt-4 border-t border-slate-700">
                      <Phone size={16} className="text-blue-400" />
                      <span className="font-mono">{resource.contact_info}</span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}

      {resources.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <House size={48} weight="duotone" className="mx-auto mb-4 opacity-50" />
          <p>No welfare resources available</p>
        </div>
      )}
    </div>
  );
};

export default Welfare;