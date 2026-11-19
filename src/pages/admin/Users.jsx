import React, { useEffect, useState } from 'react';
import { Shield, ShieldAlert, MoreVertical, Star } from 'lucide-react';
import { format } from 'date-fns';
import { apiRequest } from '../../api/client';
import toast from 'react-hot-toast';

const Users = () => {
  const [usersList, setUsersList] = useState([]);
  const [filter, setFilter] = useState('all');
  useEffect(() => {
    apiRequest('/admin/users')
      .then(({ items }) => setUsersList(items.map((user) => ({
        ...user,
        isVerified: user.verified,
        profileImage: user.picture,
        joinedDate: user.joinedDate || user.createdAt,
      }))))
      .catch((error) => toast.error(`Could not load users: ${error.message}`));
  }, []);

  const filteredUsers = usersList.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'admins') return user.role === 'admin';
    if (filter === 'users') return user.role === 'user';
    if (filter === 'verified') return user.isVerified;
    if (filter === 'unverified') return !user.isVerified;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage platform users, owners, and brokers.</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <select 
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="users">Users</option>
            <option value="admins">Administrators</option>
            <option value="verified">Verified Users</option>
            <option value="unverified">Unverified Users</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trust Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded-full object-cover" src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                      user.role === 'broker' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isVerified ? (
                      <span className="flex items-center text-green-600 text-sm font-medium">
                        <Shield className="w-4 h-4 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-500 text-sm font-medium">
                        <ShieldAlert className="w-4 h-4 mr-1" />
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className={`w-4 h-4 mr-1 ${user.trustScore >= 80 ? 'text-green-500' : user.trustScore >= 50 ? 'text-amber-500' : 'text-red-500'}`} />
                      <span className={`text-sm font-bold ${user.trustScore >= 80 ? 'text-green-600' : user.trustScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {user.trustScore}/100
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(user.joinedDate), 'MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-500">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
