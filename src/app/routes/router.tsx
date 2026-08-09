import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AccessDenied } from './AccessDenied'

const LoginForm = lazy(() => import('@/features/auth/LoginForm').then(m => ({ default: m.LoginForm })))
const AuthCallback = lazy(() => import('@/features/auth/AuthCallback').then(m => ({ default: m.AuthCallback })))
const FacultyDashboard = lazy(() => import('@/features/faculty-dashboard').then(m => ({ default: m.FacultyDashboard })))
const AdminDashboard = lazy(() => import('@/features/admin-portal').then(m => ({ default: m.AdminDashboard })))
const StudentLayout = lazy(() => import('@/features/student-portal/layouts/StudentLayout').then(m => ({ default: m.StudentLayout })))
const StudentDashboard = lazy(() => import('@/features/student-portal/pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })))

const LoadingSpinner = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
  </div>
)

const LazyElement = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
)

function LoginPage() {
  return <LoginForm />
}

export const router = (
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<LazyElement><LoginPage /></LazyElement>} />
    <Route path="/auth/callback" element={<LazyElement><AuthCallback /></LazyElement>} />
    <Route path="/access-denied" element={<AccessDenied />} />

    {/* Protected routes - Student */}
    <Route
      path="/student"
      element={
        <ProtectedRoute allowedRoles={['student']}>
          <LazyElement><StudentLayout /></LazyElement>
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<LazyElement><StudentDashboard /></LazyElement>} />
    </Route>

    {/* Protected routes - Faculty */}
    <Route
      path="/faculty/*"
      element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <LazyElement><FacultyDashboard /></LazyElement>
        </ProtectedRoute>
      }
    />


    {/* Protected routes - Admin (HOD + Dean) */}
    <Route
      path="/admin/*"
      element={
        <ProtectedRoute allowedRoles={['hod', 'dean']}>
          <LazyElement><AdminDashboard /></LazyElement>
        </ProtectedRoute>
      }
    />

    {/* Catch-all - redirect to login */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
)