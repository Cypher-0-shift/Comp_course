import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AccessDenied } from './AccessDenied'
import { LoginForm } from '@/features/auth/LoginForm'

// Placeholder layouts for each role - to be implemented in later phases
function StudentLayout() {
  return <div className="p-6">Student Dashboard (Phase 2)</div>
}

function FacultyLayout() {
  return <div className="p-6">Faculty Dashboard (Phase 3)</div>
}

function AdminLayout() {
  return <div className="p-6">Admin Dashboard (Phase 4)</div>
}

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
      path="/student/*"
      element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentLayout />
        </ProtectedRoute>
      }
    />

    {/* Protected routes - Faculty */}
    <Route
      path="/faculty/*"
      element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <FacultyLayout />
        </ProtectedRoute>
      }
    />

    {/* Protected routes - Admin (HOD + Dean) */}
    <Route
      path="/admin/*"
      element={
        <ProtectedRoute allowedRoles={['hod', 'dean']}>
          <AdminLayout />
        </ProtectedRoute>
      }
    />

    {/* Catch-all - redirect to login */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
)