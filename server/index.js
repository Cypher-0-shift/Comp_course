import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// Initialize Supabase Client securely on the backend
const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }))
app.use(express.json())
app.use(cookieParser())

// Middleware to verify session from HttpOnly cookie
const verifySession = async (req, res, next) => {
  const token = req.cookies.auth_token
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' })
  }

  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' })
  }
  
  req.user = user
  next()
}

// ---------------------------------------------------------
// STUDENT PORTAL APIs
// ---------------------------------------------------------

// 1. Get Student Profile
app.get('/api/student/profile', verifySession, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*, departments(name, code), academic_years(label)')
      .eq('user_id', req.user.id)
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 2. Get Student Enrollments
app.get('/api/student/enrollments', verifySession, async (req, res) => {
  try {
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', req.user.id)
      .single()

    if (studentError) throw studentError

    const { data, error } = await supabase
      .from('enrollments')
      .select('*, subjects(*)')
      .eq('student_id', student.id)

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ---------------------------------------------------------
// AUTHENTICATION ENDPOINTS (Proxy)
// ---------------------------------------------------------

// Login and set HttpOnly Cookie
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // Set HttpOnly cookie
    res.cookie('auth_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    // Return safe user data without exposing access_token
    res.json({ user: data.user })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})

// Logout and clear cookie
app.post('/api/auth/logout', async (req, res) => {
  res.clearCookie('auth_token')
  res.json({ success: true })
})

app.listen(port, () => {
  console.log(`Backend Proxy Server running securely on port ${port}`)
})
