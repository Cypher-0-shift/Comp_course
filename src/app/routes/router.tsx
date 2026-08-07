// Placeholder - Router will be implemented in Plan 01-03
import { Routes, Route, Navigate } from 'react-router-dom'

export const router = (
  <Routes>
    <Route path="/login" element={<div>Login Page (Plan 01-03)</div>} />
    <Route path="/student/*" element={<div>Student Dashboard (Plan 02)</div>} />
    <Route path="/faculty/*" element={<div>Faculty Dashboard (Plan 03)</div>} />
    <Route path="/admin/*" element={<div>Admin Dashboard (Plan 04)</div>} />
    <Route path="/access-denied" element={<div>Access Denied</div>} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
)