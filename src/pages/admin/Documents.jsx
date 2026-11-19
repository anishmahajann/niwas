import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../api/client';

const Documents = () => {
  const [filter, setFilter] = useState('all');

  const [documents, setDocuments] = useState([]);
  useEffect(() => {
    apiRequest('/admin/documents')
      .then(({ items }) => setDocuments(items.map((doc) => ({
        ...doc,
        listerName: doc.ownerName,
        type: 'Property document',
        uploadDate: doc.uploadedAt,
      }))))
      .catch((error) => toast.error(`Could not load documents: ${error.message}`));
  }, []);

  const filteredDocs = documents.filter(doc => {
    if (filter === 'all') return true;
    if (filter === 'verified') return doc.status === 'verified' || doc.status === 'reviewed';
    return doc.status.toLowerCase() === filter.toLowerCase();
  });

  const handleStatusChange = async (doc, newStatus) => {
    const separator = doc.id.lastIndexOf(':');
    const propertyId = doc.id.slice(0, separator);
    const index = doc.id.slice(separator + 1);
    try {
      await apiRequest(`/admin/documents/${encodeURIComponent(propertyId)}/${index}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setDocuments((previous) => previous.map((item) => item.id === doc.id ? { ...item, status: newStatus } : item));
    } catch (error) {
      toast.error(`Could not update document: ${error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'verified':
      case 'reviewed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"><CheckCircle className="w-4 h-4 mr-1" /> Verified</span>;
      case 'rejected':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"><XCircle className="w-4 h-4 mr-1" /> Rejected</span>;
      case 'not_provided':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">Not Provided</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800"><Clock className="w-4 h-4 mr-1" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Review</h1>
          <p className="mt-1 text-sm text-gray-500">Review uploaded property and identity documents.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Filter Status:</span>
        <select 
          className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Documents</option>
          <option value="pending">Pending Review</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property / Lister</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocs.map((doc) => (
                <tr key={`${doc.propertyId}-${doc.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.type}</div>
                        <div className="text-sm text-gray-500">{doc.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate max-w-[200px]">{doc.propertyTitle}</div>
                    <div className="text-sm text-gray-500">{doc.listerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'Not uploaded'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(doc.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-700" title="View Document">
                      <Eye className="w-5 h-5 inline" />
                    </a>
                    <a href={doc.url} download={doc.name} className="text-gray-500 hover:text-gray-700" title="Download">
                      <Download className="w-5 h-5 inline" />
                    </a>
                    
                    {doc.status !== 'verified' && doc.status !== 'reviewed' && (
                      <button 
                        onClick={() => handleStatusChange(doc, 'reviewed')}
                        className="text-green-600 hover:text-green-900 ml-4"
                      >
                        Approve
                      </button>
                    )}
                    {doc.status !== 'rejected' && doc.status !== 'not_provided' && (
                      <button 
                        onClick={() => handleStatusChange(doc, 'rejected')}
                        className="text-red-600 hover:text-red-900 ml-2"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDocs.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No documents found matching the filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
