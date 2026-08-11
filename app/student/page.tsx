import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { StudentProfileCard } from '@/features/student-portal/components/StudentProfileCard'

// 1. Next.js Server Component (Async)
export default async function StudentDashboardPage() {
  const supabase = createClient()

  // Secure server-side Auth verification
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Server-side Data Fetching (No APIs exposed to client)
  const { data: profile } = await supabase
    .from('students')
    .select('*, departments(name, code), academic_years(label)')
    .eq('user_id', user.id)
    .single()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, subjects(*)')
    .eq('student_id', profile?.id || '')

  if (!profile) {
    return (
      <div className="p-8">
        <h3 className="text-lg font-bold text-red-600">Student Profile Not Found</h3>
      </div>
    )
  }

  const completedCount = (enrollments || []).filter((e) => e.status === 'completed').length
  const enrolledCount = (enrollments || []).filter((e) => e.status === 'enrolled').length

  // 3. Render HTML - absolutely zero client-side fetching happens here
  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#001941] uppercase tracking-wide">
            Student Dashboard
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Welcome back, {profile.name}
          </p>
        </div>
      </div>

      {/* Passing server-fetched data as props to the UI component */}
      <StudentProfileCard
        profile={profile as any}
        completedCourses={completedCount}
        enrolledCourses={enrolledCount}
      />
    </div>
  )
}
