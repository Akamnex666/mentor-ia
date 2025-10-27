// types/auth.ts
import { User } from '@supabase/supabase-js'

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{
    data: any
    error: any
  }>
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{
    data: any
    error: any
  }>
  logout: () => Promise<{
    error: any
  }>
  resetPassword: (email: string) => Promise<{
    data: any
    error: any
  }>
  loading: boolean
}

export interface LoginFormProps {
  onSuccess?: () => void
}

export type AuthMode = 'login' | 'signup' | 'forgot'

export interface Message {
  type: 'success' | 'error' | ''
  content: string
}