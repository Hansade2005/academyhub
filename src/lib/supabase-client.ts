// Supabase Client Setup
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our tables
export interface User {
  id: string
  email: string
  password_hash: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface SkillPassport {
  id: string
  user_id: string
  title: string
  content: any
  confidence_score?: number
  created_at: string
  updated_at: string
}

export interface ProgressEntry {
  id: string
  user_id: string
  skill: string
  level: string
  score: number
  date: string
  created_at: string
}

export interface Simulation {
  id: string
  user_id: string
  simulation_type: string
  results: any
  score: number
  created_at: string
}

export interface MentorFeedback {
  id: string
  user_id: string
  mentor_id: string
  feedback: string
  rating: number
  date: string
}

export interface JobPosting {
  id: string
  employer_id: string
  title: string
  description: string
  requirements: any
  status: string
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  user_id: string
  job_id: string
  status: string
  applied_at: string
  cover_letter?: string
}

export interface Portfolio {
  id: string
  user_id: string
  title: string
  description: string
  links?: any
  status: string
  category?: string
  technologies?: string[]
  created_at: string
  updated_at: string
}

export interface Credential {
  id: string
  user_id: string
  type: string
  data: any
  issued_at: string
  expires_at?: string
  created_at: string
}

export interface FileRecord {
  id: string
  user_id: string
  filename: string
  file_url: string
  file_type: string
  file_size?: number
  uploaded_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description: string
  contract_value?: number
  status: string
  created_at: string
  updated_at: string
}

export interface UserAnalyticsProfile {
  id: string
  user_id: string
  demographics: any
  professional_background: any
  career_goals: any
  learning_preferences: any
  discovery_source?: string
  marketing_consent: boolean
  created_at: string
  updated_at: string
}

export interface AnalyticsEvent {
  id: string
  user_id: string
  event_type: string
  data: any
  created_at: string
}

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any, defaultMessage: string = 'Operation failed'): never {
  console.error('Supabase error:', error)
  let message = defaultMessage

  if (error.code === 'PGRST116') {
    message = 'Duplicate record detected'
  } else if (error.code === 'PGRST101') {
    message = 'Record not found'
  } else if (error.code === 'PGRST117') {
    message = 'Foreign key violation'
  } else if (error.message) {
    message = error.message
  }

  throw new Error(message)
}

// Helper function to convert Supabase response to standard format
export function formatSupabaseResponse<T>(response: any, data: T[]): { data: T[]; success: boolean; message: string }
export function formatSupabaseResponse<T>(response: any, data: T | null): { data: T | null; success: boolean; message: string }
export function formatSupabaseResponse<T>(response: any, data: T | T[] | null): { data: T | T[] | null; success: boolean; message: string } {
  return {
    data,
    success: response.error === null,
    message: response.error?.message || 'Operation successful'
  }
}
