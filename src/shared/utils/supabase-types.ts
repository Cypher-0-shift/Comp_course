export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string
          sl_no: number
          department_name: string
          students_registered: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sl_no: number
          department_name: string
          students_registered?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sl_no?: number
          department_name?: string
          students_registered?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_enrollments: {
        Row: {
          id: string
          sno: number | null
          student_name: string
          register_no: string
          program: string
          mobile_no: string | null
          email_id: string
          subject_code: string
          subject_name: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sno?: number | null
          student_name: string
          register_no: string
          program: string
          mobile_no?: string | null
          email_id: string
          subject_code: string
          subject_name: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sno?: number | null
          student_name?: string
          register_no?: string
          program?: string
          mobile_no?: string | null
          email_id?: string
          subject_code?: string
          subject_name?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      faculty_assignments: {
        Row: {
          id: string
          sno: number | null
          subject_code: string
          subject_name: string
          students_registered: number
          faculty_name: string
          department: string
          emp_id: string
          mobile_number: string | null
          email_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sno?: number | null
          subject_code: string
          subject_name: string
          students_registered?: number
          faculty_name: string
          department: string
          emp_id: string
          mobile_number?: string | null
          email_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sno?: number | null
          subject_code?: string
          subject_name?: string
          students_registered?: number
          faculty_name?: string
          department?: string
          emp_id?: string
          mobile_number?: string | null
          email_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

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