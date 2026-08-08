import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AccessDenied } from './AccessDenied'
import { LoginForm } from '@/features/auth/LoginForm'
import { FacultyDashboard } from '@/features/faculty-dashboard'
import { AdminDashboard } from '@/features/admin-portal'

import { StudentLayout } from '@/features/student-portal/layouts/StudentLayout'
import { StudentDashboard } from '@/features/student-portal/pages/StudentDashboard'


function LoginPage() {
  return <LoginForm />
}

export const router = (
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/access-denied" element={<AccessDenied />} />

    {/* Protected routes - Student */}
    <Route
      path="/student"
      element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<StudentDashboard />} />
    </Route>

    {/* Protected routes - Faculty */}
    <Route
      path="/faculty/*"
      element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <FacultyDashboard />
        </ProtectedRoute>
      }
    />


    {/* Protected routes - Admin (HOD + Dean) */}
    <Route
      path="/admin/*"
      element={
        <ProtectedRoute allowedRoles={['hod', 'dean']}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />

    {/* Catch-all - redirect to login */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
)