export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // ... existing tables ...
      
      content_filter_logs: {
        Row: {
          id: string
          created_at: string
          content: string
          user_id: string
          is_acceptable: boolean
          reason: string | null
          category: 'PROFANITY' | 'SELF_ADVERTISEMENT' | 'HATE_SPEECH' | 'HARASSMENT' | 'ACCEPTABLE'
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          user_id: string
          is_acceptable: boolean
          reason?: string | null
          category: 'PROFANITY' | 'SELF_ADVERTISEMENT' | 'HATE_SPEECH' | 'HARASSMENT' | 'ACCEPTABLE'
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          user_id?: string
          is_acceptable?: boolean
          reason?: string | null
          category?: 'PROFANITY' | 'SELF_ADVERTISEMENT' | 'HATE_SPEECH' | 'HARASSMENT' | 'ACCEPTABLE'
        }
      }
      
      // ... existing tables ...
    }
    // ... rest of the types ...
  }
} 