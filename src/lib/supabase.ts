import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    logger.info('Supabase client initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Supabase client', error);
  }
} else {
  logger.warn('Supabase environment variables not configured. Client will not be initialized.');
}

export const supabase = supabaseInstance as SupabaseClient;

export function isSupabaseConfigured(): boolean {
  return supabaseInstance !== null;
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    throw new Error('Supabase client is not configured. Please check your environment variables.');
  }
  return supabaseInstance;
}

export type UserRole = 'learner' | 'instructor' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  theme_preference: string | null;
  organization_id: string | null;
  is_super_admin: boolean | null;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  content_type: 'video' | 'pdf' | 'document' | 'quiz' | 'text';
  content_url: string | null;
  duration_minutes: number;
  order_index: number;
  file_size: number | null;
  file_type: string | null;
  original_filename: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  progress_percentage: number;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  completed_at: string | null;
  time_spent_minutes: number;
  created_at: string;
  updated_at: string;
}
