import { useState } from 'react'
import { Users, GraduationCap, Building2 } from 'lucide-react'
import { FacultyHeader } from './FacultyHeader'
import { FacultySidebar, type FacultyTabType } from './FacultySidebar'
import { FacultyFooter } from './FacultyFooter'
import { AnalyticsChartsSection } from './AnalyticsChartsSection'
import { StudentListTab } from './StudentListTab'
import { FacultyListTab } from './FacultyListTab'
import { DepartmentListTab } from './DepartmentListTab'
import { UploadFABModal } from './UploadFABModal'

export function FacultyDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSidebarTab, setActiveSidebarTab] = useState<FacultyTabType>('dashboard')

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-indigo-500 selection:text-white font-sans relative">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <FacultyHeader
        sidebarOpen={!sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Shell Body */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Mobile Overlay */}
        {!sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarCollapsed(true)}
            aria-hidden="true"
          />
        )}

        {/* Left Collapsible Sidebar Navigation */}
        <FacultySidebar
          activeTab={activeSidebarTab}
          onTabChange={(tab) => {
            setActiveSidebarTab(tab)
            if (window.innerWidth < 768) setSidebarCollapsed(true)
          }}
          collapsed={sidebarCollapsed}
        />

        {/* Main Content Viewport */}
        <div className="flex flex-1 flex-col overflow-y-auto w-full">
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 md:px-6 md:py-6 lg:px-8">
            {activeSidebarTab === 'dashboard' ? (
              <div className="space-y-6">
                {/* Top Split-Screen Analytics & Department Chart Section */}
                <AnalyticsChartsSection />

                {/* Main Student Directory Area */}
                <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Faculty Student Directory</h2>
                        <p className="text-xs text-slate-500">Filter enrolled students by assigned course & subject</p>
                      </div>
                    </div>
                  </div>

                  {/* Student List View with Subject Dropdown */}
                  <StudentListTab />
                </section>
              </div>
            ) : activeSidebarTab === 'faculty' ? (
              /* Sidebar Selection: Faculty Directory Tab */
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Faculty Assignment Directory</h2>
                      <p className="text-xs text-slate-500">Complete list of department faculty members and assigned subjects</p>
                    </div>
                  </div>

                  <FacultyListTab />
                </section>
              </div>
            ) : (
              /* Sidebar Selection: Department Tab */
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Department Academic Overview</h2>
                      <p className="text-xs text-slate-500">Department-wise enrollment metrics and subject allocation</p>
                    </div>
                  </div>

                  <DepartmentListTab />
                </section>
              </div>
            )}
          </main>

          {/* Footer Bar */}
          <FacultyFooter />
        </div>
      </div>

      {/* Floating Action Button & Upload Modal */}
      <UploadFABModal />
    </div>
  )
}
