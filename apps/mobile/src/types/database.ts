export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          is_admin?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      families: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          mode: Database['public']['Enums']['family_mode'];
          twin_type: Database['public']['Enums']['twin_type'] | null;
          language: Database['public']['Enums']['app_language'];
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name?: string;
          mode: Database['public']['Enums']['family_mode'];
          twin_type?: Database['public']['Enums']['twin_type'] | null;
          language?: Database['public']['Enums']['app_language'];
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          mode?: Database['public']['Enums']['family_mode'];
          twin_type?: Database['public']['Enums']['twin_type'] | null;
          language?: Database['public']['Enums']['app_language'];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'families_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      children: {
        Row: {
          id: string;
          family_id: string;
          owner_id: string;
          display_name: string;
          sex: Database['public']['Enums']['child_sex'];
          date_of_birth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          owner_id: string;
          display_name: string;
          sex: Database['public']['Enums']['child_sex'];
          date_of_birth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          owner_id?: string;
          display_name?: string;
          sex?: Database['public']['Enums']['child_sex'];
          date_of_birth?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'children_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'families';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'children_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      growth_entries: {
        Row: {
          id: string;
          child_id: string;
          owner_id: string;
          measured_at: string;
          weight_kg: number | null;
          height_cm: number | null;
          head_circumference_cm: number | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          child_id: string;
          owner_id: string;
          measured_at?: string;
          weight_kg?: number | null;
          height_cm?: number | null;
          head_circumference_cm?: number | null;
          note?: string | null;
        };
        Update: {
          id?: string;
          child_id?: string;
          owner_id?: string;
          measured_at?: string;
          weight_kg?: number | null;
          height_cm?: number | null;
          head_circumference_cm?: number | null;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'growth_entries_child_id_fkey';
            columns: ['child_id'];
            isOneToOne: false;
            referencedRelation: 'children';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'growth_entries_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      tracking_logs: {
        Row: {
          id: string;
          child_id: string;
          owner_id: string;
          log_type: Database['public']['Enums']['tracking_log_type'];
          started_at: string;
          ended_at: string | null;
          amount_ml: number | null;
          food_name: string | null;
          mood: string | null;
          diaper_kind: string | null;
          note: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          owner_id: string;
          log_type: Database['public']['Enums']['tracking_log_type'];
          started_at?: string;
          ended_at?: string | null;
          amount_ml?: number | null;
          food_name?: string | null;
          mood?: string | null;
          diaper_kind?: string | null;
          note?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          owner_id?: string;
          log_type?: Database['public']['Enums']['tracking_log_type'];
          started_at?: string;
          ended_at?: string | null;
          amount_ml?: number | null;
          food_name?: string | null;
          mood?: string | null;
          diaper_kind?: string | null;
          note?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tracking_logs_child_id_fkey';
            columns: ['child_id'];
            isOneToOne: false;
            referencedRelation: 'children';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tracking_logs_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      food_tests: {
        Row: {
          id: string;
          child_id: string;
          owner_id: string;
          food_name: string;
          test_count: number;
          last_tested_at: string | null;
          allergy_note: string | null;
          source_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          owner_id: string;
          food_name: string;
          test_count?: number;
          last_tested_at?: string | null;
          allergy_note?: string | null;
          source_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          owner_id?: string;
          food_name?: string;
          test_count?: number;
          last_tested_at?: string | null;
          allergy_note?: string | null;
          source_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'food_tests_child_id_fkey';
            columns: ['child_id'];
            isOneToOne: false;
            referencedRelation: 'children';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'food_tests_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_requests: {
        Row: {
          id: string;
          family_id: string;
          child_id: string | null;
          owner_id: string;
          prompt_type: Database['public']['Enums']['ai_prompt_type'];
          language: Database['public']['Enums']['app_language'];
          context: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          child_id?: string | null;
          owner_id: string;
          prompt_type: Database['public']['Enums']['ai_prompt_type'];
          language: Database['public']['Enums']['app_language'];
          context: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          child_id?: string | null;
          owner_id?: string;
          prompt_type?: Database['public']['Enums']['ai_prompt_type'];
          language?: Database['public']['Enums']['app_language'];
          context?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_requests_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'families';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_requests_child_id_fkey';
            columns: ['child_id'];
            isOneToOne: false;
            referencedRelation: 'children';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_requests_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_responses: {
        Row: {
          id: string;
          request_id: string;
          owner_id: string;
          provider: Database['public']['Enums']['ai_provider'];
          title: string;
          body: string;
          confidence_label: 'Low' | 'Medium' | 'High';
          sources: Json;
          raw_response: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          owner_id: string;
          provider: Database['public']['Enums']['ai_provider'];
          title: string;
          body: string;
          confidence_label: 'Low' | 'Medium' | 'High';
          sources?: Json;
          raw_response?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          owner_id?: string;
          provider?: Database['public']['Enums']['ai_provider'];
          title?: string;
          body?: string;
          confidence_label?: 'Low' | 'Medium' | 'High';
          sources?: Json;
          raw_response?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_responses_request_id_fkey';
            columns: ['request_id'];
            isOneToOne: false;
            referencedRelation: 'ai_requests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_responses_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_feedback: {
        Row: {
          id: string;
          response_id: string;
          owner_id: string;
          rating: Database['public']['Enums']['ai_feedback_rating'];
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          response_id: string;
          owner_id: string;
          rating: Database['public']['Enums']['ai_feedback_rating'];
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          response_id?: string;
          owner_id?: string;
          rating?: Database['public']['Enums']['ai_feedback_rating'];
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_feedback_response_id_fkey';
            columns: ['response_id'];
            isOneToOne: false;
            referencedRelation: 'ai_responses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_feedback_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      local_reminder_settings: {
        Row: {
          id: string;
          family_id: string;
          child_id: string | null;
          owner_id: string;
          reminder_kind: string;
          enabled: boolean;
          minutes_before: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          child_id?: string | null;
          owner_id: string;
          reminder_kind: string;
          enabled?: boolean;
          minutes_before?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          child_id?: string | null;
          owner_id?: string;
          reminder_kind?: string;
          enabled?: boolean;
          minutes_before?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'local_reminder_settings_family_id_fkey';
            columns: ['family_id'];
            isOneToOne: false;
            referencedRelation: 'families';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'local_reminder_settings_child_id_fkey';
            columns: ['child_id'];
            isOneToOne: false;
            referencedRelation: 'children';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'local_reminder_settings_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      allergen_reference_items: {
        Row: {
          id: string;
          section:
            | 'eggs'
            | 'dairy'
            | 'wheat'
            | 'soy'
            | 'sesame'
            | 'nuts'
            | 'fish'
            | 'shellfish';
          item_slug: string;
          display_name: string;
          display_order: number;
          source_label: string;
          source_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          section:
            | 'eggs'
            | 'dairy'
            | 'wheat'
            | 'soy'
            | 'sesame'
            | 'nuts'
            | 'fish'
            | 'shellfish';
          item_slug: string;
          display_name: string;
          display_order?: number;
          source_label: string;
          source_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          section?:
            | 'eggs'
            | 'dairy'
            | 'wheat'
            | 'soy'
            | 'sesame'
            | 'nuts'
            | 'fish'
            | 'shellfish';
          item_slug?: string;
          display_name?: string;
          display_order?: number;
          source_label?: string;
          source_url?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      family_mode: 'single' | 'twins';
      child_sex: 'boy' | 'girl';
      twin_type: 'boy_boy' | 'girl_girl' | 'boy_girl';
      app_language: 'en' | 'he' | 'ru';
      tracking_log_type:
        | 'sleep'
        | 'feed'
        | 'solid_food'
        | 'diaper'
        | 'mood'
        | 'note'
        | 'illness'
        | 'teething'
        | 'medication'
        | 'unusual_day';
      ai_provider: 'gemini' | 'openai' | 'claude';
      ai_prompt_type: 'sleep' | 'hunger' | 'food_tasting' | 'recipe';
      ai_feedback_rating: 'good' | 'okay' | 'bad';
    };
  };
};
