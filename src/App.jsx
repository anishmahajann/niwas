import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Toast from './components/Toast'
import AuthDialog from './components/AuthDialog'

const Home = lazy(() => import('./pages/Home'))
const Search = lazy(() => import('./pages/Search'))
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'))
const SavedProperties = lazy(() => import('./pages/SavedProperties'))
const PostProperty = lazy(() => import('./pages/PostProperty'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Listings = lazy(() => import('./pages/admin/Listings'))
const VerificationQueue = lazy(() => import('./pages/admin/VerificationQueue'))
const Documents = lazy(() => import('./pages/admin/Documents'))
const Reports = lazy(() => import('./pages/admin/Reports'))
const Users = lazy(() => import('./pages/admin/Users'))
const VerificationHistory = lazy(() => import('./pages/admin/VerificationHistory'))

function App() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-text-secondary" role="status">Loading Niwas...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/saved" element={<SavedProperties />} />
          <Route path="/post" element={<PostProperty />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="listings" element={<Listings />} />
            <Route path="verification" element={<VerificationQueue />} />
            <Route path="documents" element={<Documents />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<Users />} />
            <Route path="history" element={<VerificationHistory />} />
          </Route>
        </Routes>
      </Suspense>
      <Toast />
      <AuthDialog />
    </>
  )
}

export default App
