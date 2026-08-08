import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { AdminHeader } from './AdminHeader'
import { AdminSidebar } from './AdminSidebar'
import { AdminFooter } from './AdminFooter'
import { DepartmentOverview } from './DepartmentOverview'
import { DepartmentDetail } from './DepartmentDetail'
import { DataImportPage } from './DataImportPage'
import { StudentEnrollmentTab } from './StudentEnrollmentTab'
import { UploadFABModal } from '@/features/faculty-dashboard/components/UploadFABModal'

export function AdminDashboard() {
  const { role } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-violet-500 selection:text-white font-sans relative">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <AdminHeader
        sidebarOpen={!sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Shell Body */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left Collapsible Sidebar Navigation */}
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />

        {/* Main Content Viewport */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route index element={
                <section>
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h1 className="text-lg font-bold text-slate-900">Institutional Overview</h1>
                      <p className="text-xs text-slate-500">
                        {role === 'hod' ? 'Departmental analytics and enrolled student list' : 'All university departments — full executive visibility'}
                      </p>
                    </div>
                  </div>
                  <DepartmentOverview />
                </section>
              } />
              <Route path="students" element={
                <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <div className="mb-5 border-b border-slate-100 pb-4">
                    <h1 className="text-lg font-bold text-slate-900">Student Directory</h1>
                    <p className="text-xs text-slate-500">
                      {role === 'hod' ? 'Enrolled students in your department' : 'Enrolled students across departments'}
                    </p>
                  </div>
                  <StudentEnrollmentTab />
                </section>
              } />
              <Route path="departments/:id" element={<DepartmentDetail />} />
              <Route path="import" element={<DataImportPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>

          {/* Footer Bar */}
          <AdminFooter />
        </div>
      </div>

      {/* Floating Action Button & Upload Modal */}
      <UploadFABModal />
    </div>
  )
}
