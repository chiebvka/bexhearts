// Auto-generated types from Supabase CLI:
// npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
//
// Below is the expected shape based on our schema. Replace with generated types
// once your Supabase project is created and migration has been applied.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          denomination: string | null;
          onboarding_completed: boolean;
          couple_id: string | null;
          push_token: string | null;
          timezone: string;
          deletion_scheduled_at: string | null;
          growth_focus: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          denomination?: string | null;
          onboarding_completed?: boolean;
          couple_id?: string | null;
          push_token?: string | null;
          timezone?: string;
          deletion_scheduled_at?: string | null;
          growth_focus?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          denomination?: string | null;
          onboarding_completed?: boolean;
          couple_id?: string | null;
          push_token?: string | null;
          timezone?: string;
          deletion_scheduled_at?: string | null;
          growth_focus?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      couples: {
        Row: {
          id: string;
          partner_a_id: string;
          partner_b_id: string | null;
          invite_code: string;
          invite_code_expires_at: string | null;
          linked_at: string | null;
          streak_count: number;
          streak_last_date: string | null;
          subscription_tier: 'free' | 'premium';
          relationship_stage: 'dating' | 'engaged' | 'married' | null;
          stage_started_on: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          partner_a_id: string;
          partner_b_id?: string | null;
          invite_code: string;
          invite_code_expires_at?: string | null;
          linked_at?: string | null;
          streak_count?: number;
          streak_last_date?: string | null;
          subscription_tier?: 'free' | 'premium';
          relationship_stage?: 'dating' | 'engaged' | 'married' | null;
          stage_started_on?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          partner_a_id?: string;
          partner_b_id?: string | null;
          invite_code?: string;
          invite_code_expires_at?: string | null;
          linked_at?: string | null;
          streak_count?: number;
          streak_last_date?: string | null;
          subscription_tier?: 'free' | 'premium';
          relationship_stage?: 'dating' | 'engaged' | 'married' | null;
          stage_started_on?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      devotionals: {
        Row: {
          id: string;
          publish_date: string;
          title: string;
          scripture_reference: string;
          scripture_text: string;
          reflection: string;
          couple_action: string;
          category: string | null;
          is_premium: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          publish_date: string;
          title: string;
          scripture_reference: string;
          scripture_text: string;
          reflection: string;
          couple_action: string;
          category?: string | null;
          is_premium?: boolean;
          created_at?: string;
        };
        Update: {
          publish_date?: string;
          title?: string;
          scripture_reference?: string;
          scripture_text?: string;
          reflection?: string;
          couple_action?: string;
          category?: string | null;
          is_premium?: boolean;
        };
        Relationships: [];
      };
      devotional_progress: {
        Row: {
          id: string;
          devotional_id: string;
          user_id: string;
          couple_id: string;
          reflection_response: string | null;
          action_completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          devotional_id: string;
          user_id: string;
          couple_id: string;
          reflection_response?: string | null;
          action_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          reflection_response?: string | null;
          action_completed?: boolean;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      prayers: {
        Row: {
          id: string;
          couple_id: string;
          author_id: string;
          title: string;
          body: string | null;
          is_answered: boolean;
          answered_at: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          author_id: string;
          title: string;
          body?: string | null;
          is_answered?: boolean;
          answered_at?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          body?: string | null;
          is_answered?: boolean;
          answered_at?: string | null;
          is_archived?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      check_ins: {
        Row: {
          id: string;
          couple_id: string;
          user_id: string;
          week_of: string;
          emotional_connection: number | null;
          spiritual_connection: number | null;
          communication_quality: number | null;
          gratitude_note: string | null;
          growth_area: string | null;
          prayer_request: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          user_id: string;
          week_of: string;
          emotional_connection?: number | null;
          spiritual_connection?: number | null;
          communication_quality?: number | null;
          gratitude_note?: string | null;
          growth_area?: string | null;
          prayer_request?: string | null;
          created_at?: string;
        };
        Update: {
          emotional_connection?: number | null;
          spiritual_connection?: number | null;
          communication_quality?: number | null;
          gratitude_note?: string | null;
          growth_area?: string | null;
          prayer_request?: string | null;
        };
        Relationships: [];
      };
      boundaries: {
        Row: {
          id: string;
          couple_id: string;
          author_id: string;
          type: 'boundary' | 'temptation';
          title: string;
          description: string | null;
          action_plan: string | null;
          accountability_partner: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          author_id: string;
          type: 'boundary' | 'temptation';
          title: string;
          description?: string | null;
          action_plan?: string | null;
          accountability_partner?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: 'boundary' | 'temptation';
          title?: string;
          description?: string | null;
          action_plan?: string | null;
          accountability_partner?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      date_ideas: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          estimated_cost: 'free' | '$' | '$$' | '$$$' | null;
          estimated_duration: string | null;
          scripture_tie: string | null;
          discussion_questions: Json;
          is_premium: boolean;
          is_challenge: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          estimated_cost?: 'free' | '$' | '$$' | '$$$' | null;
          estimated_duration?: string | null;
          scripture_tie?: string | null;
          discussion_questions?: Json;
          is_premium?: boolean;
          is_challenge?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          category?: string;
          estimated_cost?: 'free' | '$' | '$$' | '$$$' | null;
          estimated_duration?: string | null;
          scripture_tie?: string | null;
          discussion_questions?: Json;
          is_premium?: boolean;
          is_challenge?: boolean;
        };
        Relationships: [];
      };
      couple_dates: {
        Row: {
          id: string;
          couple_id: string;
          date_idea_id: string;
          completed_at: string | null;
          rating: number | null;
          notes: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          date_idea_id: string;
          completed_at?: string | null;
          rating?: number | null;
          notes?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          completed_at?: string | null;
          rating?: number | null;
          notes?: string | null;
          photo_url?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_couple_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      link_partner: {
        Args: { p_invite_code: string };
        Returns: string;
      };
      request_account_deletion: {
        Args: Record<string, never>;
        Returns: string;
      };
      cancel_account_deletion: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
