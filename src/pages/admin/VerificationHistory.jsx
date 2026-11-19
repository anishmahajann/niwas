import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { apiRequest } from '../../api/client';
import toast from 'react-hot-toast';

const VerificationHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allHistory, setAllHistory] = useState([]);

  useEffect(() => {
    apiRequest('/admin/history')
      .then(({ items }) => setAllHistory(items))
      .catch((error) => toast.error(`Could not load verification history: ${error.message}`));
  }, []);

  const filteredHistory = allHistory.filter(item => 
    item.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.detail || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verification History</h1>
          <p className="mt-1 text-sm text-gray-500">Audit log of all property verification actions.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="Search by property, event, or detail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Timeline/Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((item, index) => (
                <tr key={item.id || `${item.propertyId}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {format(new Date(item.date), 'MMM d, yyyy HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{item.propertyTitle}</div>
                    <div className="text-xs text-gray-500">{item.listerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {item.event}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                    {item.detail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status || 'Info'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredHistory.length === 0 && (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <HistoryIcon className="w-12 h-12 text-gray-300 mb-2" />
            <p>No history found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationHistory;
