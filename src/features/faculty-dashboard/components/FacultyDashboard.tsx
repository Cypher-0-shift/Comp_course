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
    <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,_theme(colors.slate.900)_0%,_theme(colors.slate.950)_70%)] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Header Bar */}
      <FacultyHeader
        sidebarOpen={!sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Shell Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Collapsible Sidebar Navigation */}
        <FacultySidebar
          activeTab={activeSidebarTab}
          onTabChange={(tab) => setActiveSidebarTab(tab)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />

        {/* Main Content Viewport */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {activeSidebarTab === 'dashboard' ? (
              <div className="space-y-6">
                {/* Top Split-Screen Analytics & Department Chart Section */}
                <AnalyticsChartsSection />

                {/* Main Student Directory Area */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-100">Faculty Student Directory</h2>
                        <p className="text-xs text-slate-400">Filter enrolled students by assigned course & subject</p>
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
                <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-100">Faculty Assignment Directory</h2>
                      <p className="text-xs text-slate-400">Complete list of department faculty members and assigned subjects</p>
                    </div>
                  </div>

                  <FacultyListTab />
                </section>
              </div>
            ) : (
              /* Sidebar Selection: Department Tab */
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-100">Department Academic Overview</h2>
                      <p className="text-xs text-slate-400">Department-wise enrollment metrics and subject allocation</p>
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
