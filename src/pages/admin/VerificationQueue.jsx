import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { Shield, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const VerificationQueue = () => {
  const [properties, setProperties] = useState([]);
  const [expandedId, setExpandedId] = useState(properties.length > 0 ? properties[0].id : null);

  useEffect(() => {
    apiRequest('/admin/properties?status=pending')
      .then(({ items }) => setProperties(items))
      .catch((error) => toast.error(`Could not load verification queue: ${error.message}`));
  }, []);

  const handleStatusChange = async (propertyId, checkKey, newStatus) => {
    try {
      const { property } = await apiRequest(`/admin/properties/${encodeURIComponent(propertyId)}/verification`, {
        method: 'PATCH',
        body: JSON.stringify({ check: checkKey, status: newStatus }),
      });
      setProperties((previous) => previous.map((item) => item.id === propertyId ? property : item));
    } catch (error) {
      toast.error(`Could not update verification: ${error.message}`);
    }
  };

  const handleAction = async (propertyId, action) => {
    if (action === 'request-info') {
      toast('Information request sent to the lister.');
      return;
    }
    const status = action === 'approve' ? 'published' : 'rejected';
    try {
      await apiRequest(`/admin/properties/${encodeURIComponent(propertyId)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      toast.success(`Listing ${status}.`);
      setProperties((previous) => previous.filter((item) => item.id !== propertyId));
    } catch (error) {
      toast.error(`Could not update listing: ${error.message}`);
    }
  };

  const StatusButton = ({ status, current, onClick }) => {
    let baseClasses = "px-3 py-1 text-xs font-medium rounded-full border transition-colors ";
    
    if (status === 'verified') {
      baseClasses += current === 'verified' ? "bg-green-100 text-green-800 border-green-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50";
    } else if (status === 'failed') {
      baseClasses += current === 'failed' ? "bg-red-100 text-red-800 border-red-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50";
    } else {
      baseClasses += current === 'pending' || current === 'not_provided' ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50";
    }

    return (
      <button onClick={onClick} className={baseClasses}>
        {status}
      </button>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
        <p className="mt-1 text-sm text-gray-500">Review and verify property listings to update their trust scores.</p>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg shadow-sm border border-gray-200">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Queue is empty</h3>
          <p className="mt-1 text-sm text-gray-500">All properties have been verified!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map(property => (
            <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header / Summary */}
              <div 
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === property.id ? null : property.id)}
              >
                <div className="flex items-center space-x-4">
                  <img src={property.images[0]} alt="" className="h-16 w-16 rounded-md object-cover" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                    <p className="text-sm text-gray-500">{property.locality}, {property.city}</p>
                    <p className="text-sm text-gray-500">Lister: {property.owner.name} ({property.owner.type})</p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Trust Score</span>
                    <div className="flex items-center space-x-1">
                      <Shield className={`w-5 h-5 ${property.trustScore.total >= 70 ? 'text-green-500' : 'text-amber-500'}`} />
                      <span className={`text-xl font-bold ${property.trustScore.total >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                        {property.trustScore.total}
                      </span>
                    </div>
                  </div>
                  {expandedId === property.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {/* Expanded Checklist */}
              {expandedId === property.id && (
                <div className="border-t border-gray-100 p-4 sm:p-6 bg-gray-50">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Verification Checklist</h4>
                  
                  <div className="space-y-4">
                    {['propertyExists', 'locationVerified', 'availabilityVerified', 'ownerVerified', 'photosVerified'].map((key) => {
                      const check = property.verification[key];
                      return (
                        <div key={key} className="bg-white p-4 rounded-md border border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            {check.notes && <p className="text-xs text-gray-500 mt-1">{check.notes}</p>}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <StatusButton 
                              status="pending" 
                              current={check.status} 
                              onClick={() => handleStatusChange(property.id, key, 'pending')} 
                            />
                            <StatusButton 
                              status="verified" 
                              current={check.status} 
                              onClick={() => handleStatusChange(property.id, key, 'verified')} 
                            />
                            <StatusButton 
                              status="failed" 
                              current={check.status} 
                              onClick={() => handleStatusChange(property.id, key, 'failed')} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => handleAction(property.id, 'approve')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      <CheckCircle className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                      Approve Listing
                    </button>
                    <button 
                      onClick={() => handleAction(property.id, 'reject')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XCircle className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                      Reject Listing
                    </button>
                    <button onClick={() => handleAction(property.id, 'request-info')} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                      <AlertCircle className="mr-2 -ml-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Request Info
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerificationQueue;
