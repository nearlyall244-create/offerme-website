import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute, GuestRoute } from '@/components/ProtectedRoute'

import LandingPage from '@/pages/LandingPage'
import CategoriesPage from '@/pages/CategoriesPage'
import CategoryDetailPage from '@/pages/categories/CategoryDetailPage'
import AboutPage from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'
import NotFound from '@/pages/NotFound'
import Unauthorized from '@/pages/Unauthorized'

import RoleSelector from '@/auth/RoleSelector'
import UnifiedLogin from '@/auth/UnifiedLogin'
import UserRegister from '@/auth/userauth/UserRegister'
import UserLogin from '@/auth/userauth/UserLogin'
import BusinessRegister from '@/auth/bussinessauth/BussinessRegister.jsx'
import BusinessLogin from '@/auth/bussinessauth/BussinessLogin'
import AdminLogin from '@/auth/adminauth/AdminLogin'
import VerifyEmail from '@/auth/VerifyEmail'

import DashboardLayout from '@/components/dashboard/DashboardLayout'
import UserDashboardHome from '@/pages/dashboard/user/UserDashboardHome'
import UserProfile from '@/pages/dashboard/user/UserProfile'
import UserFavorites from '@/pages/dashboard/user/UserFavorites'
import UserSettings from '@/pages/dashboard/user/UserSettings'

import BusinessDashboardHome from '@/pages/dashboard/business/BusinessDashboardHome'
import BusinessProfile from '@/pages/dashboard/business/BusinessProfile'
import BusinessPosts from '@/pages/dashboard/business/BusinessPosts'
import OffersDealsPage from '@/pages/dashboard/business/OffersDealsPage'
import BusinessAnalytics from '@/pages/dashboard/business/BusinessAnalytics'
import BusinessSettings from '@/pages/dashboard/business/BusinessSettings'

import SellYourbussiness from '@/pages/dashboard/sellyourbusiness/SellYourbussiness'

import AdminDashboardHome from '@/pages/dashboard/admin/AdminDashboardHome'
import BusinessOwnerDetails from '@/pages/dashboard/admin/BusinessOwnerDetails'
import BusinessSubmissionApproval from '@/pages/dashboard/admin/BusinessSubmissionApproval'
import AdminSettings from '@/pages/dashboard/admin/AdminSettings'

import PrivacyPolicy from '@/pages/footer/PrivacyPolicy'
import TermsOfService from '@/pages/footer/TermsOfService'
import Sitemap from '@/pages/footer/Sitemap'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:categoryId" element={<CategoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/category/:slug" element={<CategoryDetailPage />} />
          <Route path="/category/:slug/:subSlug" element={<CategoryDetailPage />} />

          {/* Auth Routes */}
          <Route path="/auth/signup" element={<GuestRoute><RoleSelector /></GuestRoute>} />
          <Route path="/auth/login" element={<GuestRoute><UnifiedLogin /></GuestRoute>} />
          <Route path="/auth/user/register" element={<GuestRoute><UserRegister /></GuestRoute>} />
          <Route path="/auth/user/login" element={<GuestRoute><UserLogin /></GuestRoute>} />
          <Route path="/auth/business/register" element={<GuestRoute><BusinessRegister /></GuestRoute>} />
          <Route path="/auth/business/login" element={<GuestRoute><BusinessLogin /></GuestRoute>} />
          <Route path="/auth/admin/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />

          {/* Sell Your Business (accessible to both user and business roles) */}
          <Route
            path="/sell-your-business"
            element={
              <ProtectedRoute allowedRoles={['user', 'business']}>
                <SellYourbussiness />
              </ProtectedRoute>
            }
          />

          {/* User Dashboard */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute allowedRoles={['user']}><DashboardLayout role="user" /></ProtectedRoute>}
          >
            <Route index element={<UserDashboardHome />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="favorites" element={<UserFavorites />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>

          {/* Business Dashboard */}
          <Route
            path="/business/dashboard"
            element={<ProtectedRoute allowedRoles={['business']}><DashboardLayout role="business" /></ProtectedRoute>}
          >
            <Route index element={<BusinessDashboardHome />} />
            <Route path="profile" element={<BusinessProfile />} />
            <Route path="posts" element={<BusinessPosts />} />
            <Route path="offers" element={<OffersDealsPage />} />
            <Route path="analytics" element={<BusinessAnalytics />} />
            <Route path="settings" element={<BusinessSettings />} />
          </Route>

          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin" /></ProtectedRoute>}
          >
            <Route index element={<AdminDashboardHome />} />
            <Route path="owners" element={<BusinessOwnerDetails />} />
            <Route path="submissions" element={<BusinessSubmissionApproval />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Legal / Footer Pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/sitemap" element={<Sitemap />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
