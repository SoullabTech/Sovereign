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
          created_at: string
          updated_at: string
          name?: string
          avatar_url?: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
          name?: string
          avatar_url?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          name?: string
          avatar_url?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          title?: string
          metadata?: Json
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          title?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          title?: string
          metadata?: Json
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at: string
          metadata?: Json
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          created_at?: string
          metadata?: Json
        }
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