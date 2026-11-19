import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  Flag, 
  AlertTriangle, 
  Star,
  ArrowRight,
  ClipboardCheck
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const { addToast } = useApp();

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest('/admin/dashboard'), apiRequest('/admin/history')])
      .then(([metrics, history]) => {
        if (!active) return;
        setDashboard(metrics);
        setRecentActivity(history.items.slice(0, 5));
      })
      .catch((error) => {
        if (active) addToast(`Could not load admin dashboard: ${error.message}`, 'error');
      });
    return () => { active = false; };
  }, [addToast]);

  const totalListings = dashboard?.totalListings || 0;
  const verifiedListings = dashboard?.verifiedListings || 0;
  const pendingListings = dashboard?.pendingListings || 0;
  const reportedListings = dashboard?.reportedListings || 0;
  const expiredVerification = dashboard?.expiredVerification || 0;
  const avgTrustScore = dashboard?.averageTrustScore || 0;

  const stats = [
    { name: 'Total Listings', value: totalListings, icon: Building2, color: 'bg-blue-500' },
    { name: 'Verified Listings', value: verifiedListings, icon: CheckCircle, color: 'bg-teal-500' },
    { name: 'Pending Verification', value: pendingListings, icon: Clock, color: 'bg-amber-500' },
    { name: 'Reported Listings', value: reportedListings, icon: Flag, color: 'bg-red-500' },
    { name: 'Expired Verification', value: expiredVerification, icon: AlertTriangle, color: 'bg-orange-500' },
    { name: 'Avg Trust Score', value: avgTrustScore, icon: Star, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor platform health and verification status.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="relative overflow-hidden bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <dt>
                <div className={`absolute p-3 rounded-md ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">{stat.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </dd>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Recent Verification Activity</h3>
          </div>
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((event, eventIdx) => (
                  <li key={`${event.propertyId}-${event.date}-${event.event}`}>
                    <div className="relative pb-8">
                      {eventIdx !== recentActivity.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                            ${event.status === 'Verified' ? 'bg-green-500' : 
                              event.status === 'Failed' ? 'bg-red-500' : 'bg-amber-500'}`}>
                            <CheckCircle className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">{event.event}</span>
                              {' '}on{' '}
                              <span className="font-medium text-gray-900">{event.propertyTitle}</span>
                            </p>
                            <p className="mt-0.5 text-sm text-gray-500">{event.detail}</p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            {event.date && formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 border-t border-gray-100 pt-6">
              <Link to="/admin/history" className="text-sm font-medium text-teal-600 hover:text-teal-500 flex items-center">
                View all history
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Link to="/admin/verification" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <div className="flex items-center">
                  <ClipboardCheck className="w-6 h-6 text-teal-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Review Queue</h4>
                    <p className="text-sm text-gray-500">{pendingListings} properties awaiting review</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Link>
              
              <Link to="/admin/reports" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <div className="flex items-center">
                  <Flag className="w-6 h-6 text-red-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Pending Reports</h4>
                    <p className="text-sm text-gray-500">{reportedListings} user reports to investigate</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Link>

              <Link to="/admin/listings?filter=expired" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <div className="flex items-center">
                  <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Expired Listings</h4>
                    <p className="text-sm text-gray-500">{expiredVerification} listings need re-verification</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
