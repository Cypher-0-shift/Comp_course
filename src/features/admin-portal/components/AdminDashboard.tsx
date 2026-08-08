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
    <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,_theme(colors.slate.900)_0%,_theme(colors.slate.950)_70%)] text-slate-100 selection:bg-violet-500 selection:text-white">
      {/* Top Header Bar */}
      <AdminHeader
        sidebarOpen={!sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Shell Body */}
      <div className="flex flex-1 overflow-hidden">
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
                      <h1 className="text-lg font-bold text-slate-100">Institutional Overview</h1>
                      <p className="text-xs text-slate-400">
                        {role === 'hod' ? 'Departmental analytics and enrolled student list' : 'All university departments — full executive visibility'}
                      </p>
                    </div>
                  </div>
                  <DepartmentOverview />
                </section>
              } />
              <Route path="students" element={
                <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
                  <div className="mb-5 border-b border-slate-800 pb-4">
                    <h1 className="text-lg font-bold text-slate-100">Student Directory</h1>
                    <p className="text-xs text-slate-400">
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
