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
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'staff'
          full_name: string
          active: boolean
          created_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          email: string
          role: 'admin' | 'staff'
          full_name: string
          active?: boolean
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'staff'
          full_name?: string
          active?: boolean
          created_at?: string
          last_login?: string | null
        }
      }
      vehicle_categories: {
        Row: {
          id: string
          name: string
          base_rate: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          base_rate: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          base_rate?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      toll_passes: {
        Row: {
          id: string
          vehicle_number: string
          category_id: string
          valid_from: string
          valid_until: string
          status: 'active' | 'expired' | 'cancelled'
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          vehicle_number: string
          category_id: string
          valid_from?: string
          valid_until: string
          status: 'active' | 'expired' | 'cancelled'
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          vehicle_number?: string
          category_id?: string
          valid_from?: string
          valid_until?: string
          status?: 'active' | 'expired' | 'cancelled'
          created_by?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          pass_id: string
          amount: number
          processed_by: string
          processed_at: string
          receipt_number: string
          notes: string | null
        }
        Insert: {
          id?: string
          pass_id: string
          amount: number
          processed_by: string
          processed_at?: string
          receipt_number: string
          notes?: string | null
        }
        Update: {
          id?: string
          pass_id?: string
          amount?: number
          processed_by?: string
          processed_at?: string
          receipt_number?: string
          notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}