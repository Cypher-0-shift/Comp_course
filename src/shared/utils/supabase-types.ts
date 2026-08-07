// Placeholder Database types for Supabase
// This will be replaced by `supabase gen types typescript --project-id <id>`
// Run after linking to Supabase project: `npx supabase gen types typescript --project-id <project-ref> > src/shared/utils/supabase-types.ts`

export interface Database {
  public: {
    Tables: {
      academic_years: {
        Row: {
          id: string
          start_year: number
          end_year: number
          is_active: boolean
          label: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          start_year: number
          end_year: number
          is_active?: boolean
          label?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          start_year?: number
          end_year?: number
          is_active?: boolean
          label?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          id: string
          name: string
          code: string
          academic_year_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          academic_year_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          academic_year_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'departments_academic_year_id_fkey'
            columns: ['academic_year_id']
            isOneToOne: false
            referencedRelation: 'academic_years'
            referencedColumns: ['id']
          }
        ]
      }
      faculty: {
        Row: {
          id: string
          user_id: string
          emp_id: string
          name: string
          email: string
          phone: string | null
          department_id: string
          academic_year_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          emp_id: string
          name: string
          email: string
          phone?: string | null
          department_id: string
          academic_year_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          emp_id?: string
          name?: string
          email?: string
          phone?: string | null
          department_id?: string
          academic_year_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'faculty_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'faculty_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'faculty_academic_year_id_fkey'
            columns: ['academic_year_id']
            isOneToOne: false
            referencedRelation: 'academic_years'
            referencedColumns: ['id']
          }
        ]
      }
      subjects: {
        Row: {
          id: string
          code: string
          name: string
          department_id: string
          academic_year_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          department_id: string
          academic_year_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          department_id?: string
          academic_year_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subjects_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'subjects_academic_year_id_fkey'
            columns: ['academic_year_id']
            isOneToOne: false
            referencedRelation: 'academic_years'
            referencedColumns: ['id']
          }
        ]
      }
      faculty_subjects: {
        Row: {
          id: string
          faculty_id: string
          subject_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          faculty_id: string
          subject_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          faculty_id?: string
          subject_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'faculty_subjects_faculty_id_fkey'
            columns: ['faculty_id']
            isOneToOne: false
            referencedRelation: 'faculty'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'faculty_subjects_subject_id_fkey'
            columns: ['subject_id']
            isOneToOne: false
            referencedRelation: 'subjects'
            referencedColumns: ['id']
          }
        ]
      }
      students: {
        Row: {
          id: string
          user_id: string
          register_no: string
          name: string
          program: string
          mobile: string | null
          email: string | null
          department_id: string
          academic_year_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          register_no: string
          name: string
          program: string
          mobile?: string | null
          email?: string | null
          department_id: string
          academic_year_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          register_no?: string
          name?: string
          program?: string
          mobile?: string | null
          email?: string | null
          department_id?: string
          academic_year_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'students_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'students_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'students_academic_year_id_fkey'
            columns: ['academic_year_id']
            isOneToOne: false
            referencedRelation: 'academic_years'
            referencedColumns: ['id']
          }
        ]
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          subject_id: string
          academic_year_id: string
          status: 'enrolled' | 'completed' | 'dropped'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject_id: string
          academic_year_id: string
          status?: 'enrolled' | 'completed' | 'dropped'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject_id?: string
          academic_year_id?: string
          status?: 'enrolled' | 'completed' | 'dropped'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'enrollments_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'enrollments_subject_id_fkey'
            columns: ['subject_id']
            isOneToOne: false
            referencedRelation: 'subjects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'enrollments_academic_year_id_fkey'
            columns: ['academic_year_id']
            isOneToOne: false
            referencedRelation: 'academic_years'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      enrollment_status: 'enrolled' | 'completed' | 'dropped'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
        Database['public']['Views'])
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database['public']['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database['public']['CompositeTypes']
    ? Database['public']['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never