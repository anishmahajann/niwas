import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  ClipboardCheck, 
  FileStack, 
  Flag, 
  Users, 
  History,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, authLoading, openAuthDialog } = useApp();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Listings', path: '/admin/listings', icon: Building2 },
    { name: 'Verification Queue', path: '/admin/verification', icon: ClipboardCheck },
    { name: 'Documents', path: '/admin/documents', icon: FileStack },
    { name: 'User Reports', path: '/admin/reports', icon: Flag },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Verification History', path: '/admin/history', icon: History },
  ];

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">Checking your Niwas session…</div>;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <section className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Admin access required</h1>
          <p className="mt-2 text-sm text-slate-600">
            {user ? 'This account is not authorized to access the admin workspace.' : 'Sign in with an administrator Google account to continue.'}
          </p>
          {!user && <button type="button" onClick={openAuthDialog} className="mt-5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">Sign in</button>}
          <Link to="/" className="mt-4 block text-sm font-medium text-teal-700 hover:text-teal-900">Return to Niwas</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-primary-dark text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full bg-[#1e3a5f]">
          <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
            <Link to="/admin" className="text-2xl font-bold tracking-tight">
              Niwas <span className="text-teal-400">Admin</span>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-gray-300 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <Link
              to="/"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
            >
              <ExternalLink className="w-5 h-5 mr-3" />
              Back to Site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center h-16 px-6 bg-white border-b border-gray-200 lg:hidden shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 text-xl font-semibold text-gray-900">Niwas Admin</span>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
