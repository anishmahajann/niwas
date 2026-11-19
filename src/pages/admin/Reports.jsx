import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, AlertCircle, XCircle, Search, Eye } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { apiRequest } from '../../api/client';

const Reports = () => {
  const [reportsList, setReportsList] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    apiRequest('/admin/reports')
      .then(({ items }) => setReportsList(items.map((report) => ({
        ...report,
        userName: report.reporterName,
        detail: report.details,
        date: report.createdAt,
      }))))
      .catch((error) => toast.error(`Could not load reports: ${error.message}`));
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { report } = await apiRequest(`/admin/reports/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setReportsList((previous) => previous.map((item) => item.id === id ? {
        ...item,
        ...report,
        userName: report.reporterName,
        detail: report.details,
        date: report.createdAt,
      } : item));
      toast.success(`Report status updated to ${newStatus}`);
    } catch (error) {
      toast.error(`Could not update report: ${error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'investigating': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed': return 'bg-red-100 text-red-800 border-red-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Reports</h1>
        <p className="mt-1 text-sm text-gray-500">Manage and investigate flags raised by users.</p>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {reportsList.map((report) => {
            const status = report.status;
            return (
            <li key={report.id} className="hover:bg-gray-50 transition-colors">
              <div 
                className="px-6 py-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <span className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        status === 'confirmed' ? 'bg-red-100' : 'bg-amber-100'
                      }`}>
                        <Flag className={`h-5 w-5 ${
                          status === 'confirmed' ? 'text-red-600' : 'text-amber-600'
                        }`} />
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Report #{report.id}</p>
                      <p className="text-sm text-gray-500">Property ID: {report.propertyId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {format(new Date(report.date), 'MMM d, yyyy')}
                    </span>
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(status)}`}>
                      {status}
                    </span>
                  </div>
                </div>
              </div>

              {expandedId === report.id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Report Details</h4>
                      <div className="bg-white p-4 rounded-md border border-gray-200">
                        <p className="text-sm font-medium text-gray-900">Reason: {report.reason}</p>
                        <p className="text-sm text-gray-600 mt-2">"{report.detail}"</p>
                        <p className="text-xs text-gray-500 mt-4">Reported by: {report.userName}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Actions</h4>
                      <div className="space-y-3">
                        <Link to={`/property/${report.propertyId}`} onClick={(event) => event.stopPropagation()} className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <Eye className="mr-2 -ml-1 h-5 w-5 text-gray-400" />
                          View Property Listing
                        </Link>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(report.id, 'investigating'); }}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200"
                          >
                            <Search className="mr-2 -ml-1 h-4 w-4" />
                            Investigate
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(report.id, 'confirmed'); }}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            <AlertCircle className="mr-2 -ml-1 h-4 w-4" />
                            Confirm
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(report.id, 'dismissed'); }}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <XCircle className="mr-2 -ml-1 h-4 w-4 text-gray-400" />
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Reports;
