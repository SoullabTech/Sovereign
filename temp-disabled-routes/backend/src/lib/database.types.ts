export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CrystalFocusType =
  | "career"
  | "spiritual"
  | "relational"
  | "health"
  | "creative"
  | "other";

export interface Database {
  public: {
    Tables: {
      dreams: {
        Row: {
          id: number;
          content: string;
          created_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
        };
      };

      survey_questions: {
        Row: {
          id: string;
          text: string;
          element: string;
          weight: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          text: string;
          element: string;
          weight?: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          text?: string;
          element?: string;
          weight?: number;
          created_at?: string | null;
        };
      };

      survey_responses: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          answer: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          answer: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          answer?: number;
          created_at?: string | null;
        };
      };

      elemental_profiles: {
        Row: {
          id: string;
          user_id: string;
          fire: number;
          water: number;
          earth: number;
          air: number;
          aether: number;
          crystal_focus: {
            type: CrystalFocusType;
            customDescription?: string;
            challenges: string;
            aspirations: string;
          } | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          fire: number;
          water: number;
          earth: number;
          air: number;
          aether: number;
          crystal_focus?: {
            type: CrystalFocusType;
            customDescription?: string;
            challenges: string;
            aspirations: string;
          } | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          fire?: number;
          water?: number;
          earth?: number;
          air?: number;
          aether?: number;
          crystal_focus?: {
            type: CrystalFocusType;
            customDescription?: string;
            challenges: string;
            aspirations: string;
          } | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      crystal_focus_type: CrystalFocusType;
    };
  };
}
