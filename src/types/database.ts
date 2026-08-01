export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity_date: string
          activity_type: string
          couple_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          activity_type: string
          couple_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          couple_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      boundaries: {
        Row: {
          accountability_partner: string | null
          action_plan: string | null
          author_id: string
          category: string | null
          couple_id: string
          created_at: string | null
          deactivated_at: string | null
          deactivated_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          accountability_partner?: string | null
          action_plan?: string | null
          author_id: string
          category?: string | null
          couple_id: string
          created_at?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          accountability_partner?: string | null
          action_plan?: string | null
          author_id?: string
          category?: string | null
          couple_id?: string
          created_at?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boundaries_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boundaries_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boundaries_deactivated_by_fkey"
            columns: ["deactivated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          communication_quality: number | null
          couple_id: string
          created_at: string | null
          emotional_connection: number | null
          gratitude_note: string | null
          growth_area: string | null
          id: string
          prayer_request: string | null
          share_growth_note: boolean
          share_prayer_request: boolean
          spiritual_connection: number | null
          user_id: string
          week_of: string
        }
        Insert: {
          communication_quality?: number | null
          couple_id: string
          created_at?: string | null
          emotional_connection?: number | null
          gratitude_note?: string | null
          growth_area?: string | null
          id?: string
          prayer_request?: string | null
          share_growth_note?: boolean
          share_prayer_request?: boolean
          spiritual_connection?: number | null
          user_id: string
          week_of: string
        }
        Update: {
          communication_quality?: number | null
          couple_id?: string
          created_at?: string | null
          emotional_connection?: number | null
          gratitude_note?: string | null
          growth_area?: string | null
          id?: string
          prayer_request?: string | null
          share_growth_note?: boolean
          share_prayer_request?: boolean
          spiritual_connection?: number | null
          user_id?: string
          week_of?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_dates: {
        Row: {
          accepted_at: string | null
          completed_at: string | null
          couple_id: string
          created_at: string | null
          custom_description: string | null
          custom_title: string | null
          date_idea_id: string | null
          id: string
          notes: string | null
          photo_url: string | null
          rating: number | null
          scheduled_for: string | null
          suggested_by: string | null
        }
        Insert: {
          accepted_at?: string | null
          completed_at?: string | null
          couple_id: string
          created_at?: string | null
          custom_description?: string | null
          custom_title?: string | null
          date_idea_id?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          rating?: number | null
          scheduled_for?: string | null
          suggested_by?: string | null
        }
        Update: {
          accepted_at?: string | null
          completed_at?: string | null
          couple_id?: string
          created_at?: string | null
          custom_description?: string | null
          custom_title?: string | null
          date_idea_id?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          rating?: number | null
          scheduled_for?: string | null
          suggested_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_dates_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_dates_date_idea_id_fkey"
            columns: ["date_idea_id"]
            isOneToOne: false
            referencedRelation: "date_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_dates_suggested_by_fkey"
            columns: ["suggested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_events: {
        Row: {
          couple_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json
          ref_id: string | null
          user_id: string | null
        }
        Insert: {
          couple_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          ref_id?: string | null
          user_id?: string | null
        }
        Update: {
          couple_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          ref_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_events_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_milestones: {
        Row: {
          color: string | null
          couple_id: string
          created_at: string | null
          created_by: string
          event_date: string
          event_time: string | null
          icon: string | null
          id: string
          is_recurring: boolean | null
          title: string
        }
        Insert: {
          color?: string | null
          couple_id: string
          created_at?: string | null
          created_by: string
          event_date: string
          event_time?: string | null
          icon?: string | null
          id?: string
          is_recurring?: boolean | null
          title: string
        }
        Update: {
          color?: string | null
          couple_id?: string
          created_at?: string | null
          created_by?: string
          event_date?: string
          event_time?: string | null
          icon?: string | null
          id?: string
          is_recurring?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_milestones_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_milestones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          country_code: string | null
          created_at: string | null
          grace_days_remaining: number
          grace_week: string | null
          id: string
          invite_code: string
          invite_code_expires_at: string | null
          is_long_distance: boolean
          leaderboard_number: number
          leaderboard_opt_in: boolean
          linked_at: string | null
          longest_streak: number
          longest_streak_ended_on: string | null
          longest_streak_started_on: string | null
          partner_a_id: string
          partner_b_id: string | null
          relationship_stage: string | null
          stage_started_on: string | null
          streak_count: number | null
          streak_last_date: string | null
          streak_started_on: string | null
          subscription_tier: string | null
          timezone: string
          unlinked_at: string | null
          unlinked_by: string | null
          updated_at: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          grace_days_remaining?: number
          grace_week?: string | null
          id?: string
          invite_code: string
          invite_code_expires_at?: string | null
          is_long_distance?: boolean
          leaderboard_number?: number
          leaderboard_opt_in?: boolean
          linked_at?: string | null
          longest_streak?: number
          longest_streak_ended_on?: string | null
          longest_streak_started_on?: string | null
          partner_a_id: string
          partner_b_id?: string | null
          relationship_stage?: string | null
          stage_started_on?: string | null
          streak_count?: number | null
          streak_last_date?: string | null
          streak_started_on?: string | null
          subscription_tier?: string | null
          timezone?: string
          unlinked_at?: string | null
          unlinked_by?: string | null
          updated_at?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          grace_days_remaining?: number
          grace_week?: string | null
          id?: string
          invite_code?: string
          invite_code_expires_at?: string | null
          is_long_distance?: boolean
          leaderboard_number?: number
          leaderboard_opt_in?: boolean
          linked_at?: string | null
          longest_streak?: number
          longest_streak_ended_on?: string | null
          longest_streak_started_on?: string | null
          partner_a_id?: string
          partner_b_id?: string | null
          relationship_stage?: string | null
          stage_started_on?: string | null
          streak_count?: number | null
          streak_last_date?: string | null
          streak_started_on?: string | null
          subscription_tier?: string | null
          timezone?: string
          unlinked_at?: string | null
          unlinked_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couples_partner_a_id_fkey"
            columns: ["partner_a_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couples_partner_b_id_fkey"
            columns: ["partner_b_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couples_unlinked_by_fkey"
            columns: ["unlinked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      date_idea_ratings: {
        Row: {
          couple_id: string
          created_at: string | null
          date_idea_id: string
          id: string
          rating: number
          review: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string | null
          date_idea_id: string
          id?: string
          rating: number
          review?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string | null
          date_idea_id?: string
          id?: string
          rating?: number
          review?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "date_idea_ratings_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "date_idea_ratings_date_idea_id_fkey"
            columns: ["date_idea_id"]
            isOneToOne: false
            referencedRelation: "date_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "date_idea_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      date_ideas: {
        Row: {
          accessibility_tags: string[]
          category: string
          context_note: string | null
          country_tags: string[]
          created_at: string | null
          description: string
          discussion_questions: Json | null
          estimated_cost: string | null
          estimated_duration: string | null
          id: string
          is_challenge: boolean | null
          is_premium: boolean | null
          is_virtual: boolean
          location_type: string
          scripture_tie: string | null
          season: string
          stage_fit: string[]
          title: string
        }
        Insert: {
          accessibility_tags?: string[]
          category: string
          context_note?: string | null
          country_tags?: string[]
          created_at?: string | null
          description: string
          discussion_questions?: Json | null
          estimated_cost?: string | null
          estimated_duration?: string | null
          id?: string
          is_challenge?: boolean | null
          is_premium?: boolean | null
          is_virtual?: boolean
          location_type?: string
          scripture_tie?: string | null
          season?: string
          stage_fit?: string[]
          title: string
        }
        Update: {
          accessibility_tags?: string[]
          category?: string
          context_note?: string | null
          country_tags?: string[]
          created_at?: string | null
          description?: string
          discussion_questions?: Json | null
          estimated_cost?: string | null
          estimated_duration?: string | null
          id?: string
          is_challenge?: boolean | null
          is_premium?: boolean | null
          is_virtual?: boolean
          location_type?: string
          scripture_tie?: string | null
          season?: string
          stage_fit?: string[]
          title?: string
        }
        Relationships: []
      }
      devotional_drafts: {
        Row: {
          approved: boolean
          category: string | null
          couple_action: string
          created_at: string | null
          focus_tags: string[]
          id: string
          reflection: string
          scripture_reference: string
          scripture_text: string
          stage_tags: string[]
          title: string
        }
        Insert: {
          approved?: boolean
          category?: string | null
          couple_action: string
          created_at?: string | null
          focus_tags?: string[]
          id?: string
          reflection: string
          scripture_reference: string
          scripture_text: string
          stage_tags?: string[]
          title: string
        }
        Update: {
          approved?: boolean
          category?: string | null
          couple_action?: string
          created_at?: string | null
          focus_tags?: string[]
          id?: string
          reflection?: string
          scripture_reference?: string
          scripture_text?: string
          stage_tags?: string[]
          title?: string
        }
        Relationships: []
      }
      devotional_progress: {
        Row: {
          action_completed: boolean | null
          completed_at: string | null
          couple_id: string
          created_at: string | null
          devotional_id: string
          id: string
          reflection_response: string | null
          user_id: string
        }
        Insert: {
          action_completed?: boolean | null
          completed_at?: string | null
          couple_id: string
          created_at?: string | null
          devotional_id: string
          id?: string
          reflection_response?: string | null
          user_id: string
        }
        Update: {
          action_completed?: boolean | null
          completed_at?: string | null
          couple_id?: string
          created_at?: string | null
          devotional_id?: string
          id?: string
          reflection_response?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_progress_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotional_progress_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotional_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      devotionals: {
        Row: {
          category: string | null
          couple_action: string
          created_at: string | null
          focus_tags: string[]
          id: string
          is_premium: boolean | null
          publish_date: string | null
          reflection: string
          scripture_reference: string
          scripture_text: string
          sequence: number | null
          stage_tags: string[]
          title: string
        }
        Insert: {
          category?: string | null
          couple_action: string
          created_at?: string | null
          focus_tags?: string[]
          id?: string
          is_premium?: boolean | null
          publish_date?: string | null
          reflection: string
          scripture_reference: string
          scripture_text: string
          sequence?: number | null
          stage_tags?: string[]
          title: string
        }
        Update: {
          category?: string | null
          couple_action?: string
          created_at?: string | null
          focus_tags?: string[]
          id?: string
          is_premium?: boolean | null
          publish_date?: string | null
          reflection?: string
          scripture_reference?: string
          scripture_text?: string
          sequence?: number | null
          stage_tags?: string[]
          title?: string
        }
        Relationships: []
      }
      memories: {
        Row: {
          couple_id: string
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          memory_date: string
          title: string
        }
        Insert: {
          couple_id: string
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          memory_date?: string
          title: string
        }
        Update: {
          couple_id?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          memory_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "memories_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_images: {
        Row: {
          couple_id: string
          created_at: string | null
          id: string
          image_url: string
          memory_id: string
          position: number | null
        }
        Insert: {
          couple_id: string
          created_at?: string | null
          id?: string
          image_url: string
          memory_id: string
          position?: number | null
        }
        Update: {
          couple_id?: string
          created_at?: string | null
          id?: string
          image_url?: string
          memory_id?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_images_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_images_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_reactions: {
        Row: {
          couple_id: string
          created_at: string | null
          id: string
          memory_id: string
          note: string | null
          reaction: string | null
          user_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string | null
          id?: string
          memory_id: string
          note?: string | null
          reaction?: string | null
          user_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string | null
          id?: string
          memory_id?: string
          note?: string | null
          reaction?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_reactions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_reactions_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          category: string
          couple_id: string | null
          created_at: string
          id: string
          pushed_at: string | null
          read_at: string | null
          recipient_id: string
          route: string | null
          title: string
        }
        Insert: {
          body?: string | null
          category: string
          couple_id?: string | null
          created_at?: string
          id?: string
          pushed_at?: string | null
          read_at?: string | null
          recipient_id: string
          route?: string | null
          title: string
        }
        Update: {
          body?: string | null
          category?: string
          couple_id?: string | null
          created_at?: string
          id?: string
          pushed_at?: string | null
          read_at?: string | null
          recipient_id?: string
          route?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          couple_id: string
          created_at: string | null
          id: string
          points: number
          reason: string
          user_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string | null
          id?: string
          points: number
          reason: string
          user_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string | null
          id?: string
          points?: number
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prayers: {
        Row: {
          ai_generated_at: string | null
          ai_prayer: string | null
          ai_verse_ref: string | null
          ai_verse_text: string | null
          answered_at: string | null
          archived_at: string | null
          author_id: string
          body: string | null
          couple_id: string
          created_at: string | null
          id: string
          is_answered: boolean | null
          is_archived: boolean | null
          is_private: boolean
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_generated_at?: string | null
          ai_prayer?: string | null
          ai_verse_ref?: string | null
          ai_verse_text?: string | null
          answered_at?: string | null
          archived_at?: string | null
          author_id: string
          body?: string | null
          couple_id: string
          created_at?: string | null
          id?: string
          is_answered?: boolean | null
          is_archived?: boolean | null
          is_private?: boolean
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_generated_at?: string | null
          ai_prayer?: string | null
          ai_verse_ref?: string | null
          ai_verse_text?: string | null
          answered_at?: string | null
          archived_at?: string | null
          author_id?: string
          body?: string | null
          couple_id?: string
          created_at?: string | null
          id?: string
          is_answered?: boolean | null
          is_archived?: boolean | null
          is_private?: boolean
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prayers_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayers_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_prayer_consent_at: string | null
          avatar_url: string | null
          couple_id: string | null
          created_at: string | null
          deletion_scheduled_at: string | null
          denomination: string | null
          email: string
          full_name: string | null
          growth_focus: string[]
          id: string
          notification_prefs: Json
          onboarding_completed: boolean | null
          push_token: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          ai_prayer_consent_at?: string | null
          avatar_url?: string | null
          couple_id?: string | null
          created_at?: string | null
          deletion_scheduled_at?: string | null
          denomination?: string | null
          email: string
          full_name?: string | null
          growth_focus?: string[]
          id: string
          notification_prefs?: Json
          onboarding_completed?: boolean | null
          push_token?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_prayer_consent_at?: string | null
          avatar_url?: string | null
          couple_id?: string | null
          created_at?: string | null
          deletion_scheduled_at?: string | null
          denomination?: string | null
          email?: string
          full_name?: string | null
          growth_focus?: string[]
          id?: string
          notification_prefs?: Json
          onboarding_completed?: boolean | null
          push_token?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_couple"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_counters: {
        Row: {
          couple_id: string
          kind: string
          used: number
          used_on: string
        }
        Insert: {
          couple_id: string
          kind: string
          used?: number
          used_on: string
        }
        Update: {
          couple_id?: string
          kind?: string
          used?: number
          used_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_counters_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          first_visited_at: string | null
          id: string
          landing_path: string | null
          name: string | null
          referrer: string | null
          source: string | null
          stage: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_visited_at?: string | null
          id?: string
          landing_path?: string | null
          name?: string | null
          referrer?: string | null
          source?: string | null
          stage?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_visited_at?: string | null
          id?: string
          landing_path?: string | null
          name?: string | null
          referrer?: string | null
          source?: string | null
          stage?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _hard_delete_account: { Args: { p_user_id: string }; Returns: undefined }
      cancel_account_deletion: { Args: never; Returns: undefined }
      consume_usage_credit: { Args: { p_kind: string }; Returns: Json }
      get_activity_daily_counts: {
        Args: never
        Returns: {
          activity_count: number
          activity_date: string
        }[]
      }
      get_activity_stats: {
        Args: never
        Returns: {
          activity_type: string
          best_streak: number
          last_done: string
        }[]
      }
      get_date_idea_aggregates: {
        Args: never
        Returns: {
          avg_rating: number
          couples_count: number
          date_idea_id: string
        }[]
      }
      get_date_idea_country_stats: {
        Args: { p_date_idea_id: string }
        Returns: {
          avg_rating: number
          country_code: string
          couples_count: number
        }[]
      }
      get_leaderboard: {
        Args: { entry_limit?: number }
        Returns: {
          country_code: string
          couple_number: number
          is_you: boolean
          label: string
          points: number
          rank: number
        }[]
      }
      get_my_couple_id: { Args: never; Returns: string }
      // ⚠️ THE ONLY HAND-ADDED ENTRY IN THIS FILE. Everything else was
      // regenerated from the local DB on 2026-07-27 (`supabase gen types
      // typescript --local`) and matched the hand-maintained version with ZERO
      // column drift across ~12 sessions of manual edits.
      //
      // This one is here because migration 00036 (comp access) has not been
      // applied yet, so the function doesn't exist in the DB to generate from.
      // DELETE THIS LINE after the owner applies 00036 and regenerates.
      has_comp_access: { Args: never; Returns: boolean }
      get_today_devotional: {
        Args: never
        Returns: {
          category: string | null
          couple_action: string
          created_at: string | null
          focus_tags: string[]
          id: string
          is_premium: boolean | null
          publish_date: string | null
          reflection: string
          scripture_reference: string
          scripture_text: string
          sequence: number | null
          stage_tags: string[]
          title: string
        }[]
        SetofOptions: {
          from: "*"
          to: "devotionals"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      leave_couple: { Args: never; Returns: undefined }
      link_partner: { Args: { p_invite_code: string }; Returns: string }
      mask_name: { Args: { name: string }; Returns: string }
      process_due_account_deletions: { Args: never; Returns: number }
      promote_approved_devotionals: { Args: never; Returns: number }
      recompute_couple_timezone: {
        Args: { p_couple_id: string }
        Returns: undefined
      }
      request_account_deletion: { Args: never; Returns: string }
      tz_offset_seconds: { Args: { p_timezone: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

