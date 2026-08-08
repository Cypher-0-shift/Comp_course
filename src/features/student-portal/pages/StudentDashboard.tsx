import { useEffect, useState } from 'react'
import { StudentWithRelations, EnrollmentWithRelations } from '@/shared/types'
import { getStudentProfile, getStudentEnrollments } from '../api/student'
import { StudentProfileCard } from '../components/StudentProfileCard'
import { EnrolledCoursesTable } from '../components/EnrolledCoursesTable'
import { Loader2 } from 'lucide-react'

export function StudentDashboard() {
  const [profile, setProfile] = useState<StudentWithRelations | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch data concurrently
    Promise.all([getStudentProfile(), getStudentEnrollments()])
      .then(([profileData, enrollmentsData]) => {
        setProfile(profileData)
        setEnrollments(enrollmentsData)
      })
      .catch((error) => {
        console.error('Failed to load student data', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-slate-500">
        Failed to load profile. Please try again.
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {profile.name.split(' ')[0]}</p>
        </div>
      </div>
      
      <StudentProfileCard student={profile} />
      <EnrolledCoursesTable enrollments={enrollments} />
    </div>
  )
}
