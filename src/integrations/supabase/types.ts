export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      avatar_items: {
        Row: {
          available_from: string | null
          available_until: string | null
          category: string
          created_at: string
          description: string | null
          gold_price: number | null
          icon: string
          id: string
          is_seasonal: boolean
          name: string
          required_level: number
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          category?: string
          created_at?: string
          description?: string | null
          gold_price?: number | null
          icon?: string
          id?: string
          is_seasonal?: boolean
          name: string
          required_level?: number
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          category?: string
          created_at?: string
          description?: string | null
          gold_price?: number | null
          icon?: string
          id?: string
          is_seasonal?: boolean
          name?: string
          required_level?: number
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          created_at: string
          criteria_type: string
          criteria_value: number
          description: string
          icon: string
          id: string
          is_seasonal: boolean
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          criteria_type: string
          criteria_value?: number
          description?: string
          icon?: string
          id?: string
          is_seasonal?: boolean
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          criteria_type?: string
          criteria_value?: number
          description?: string
          icon?: string
          id?: string
          is_seasonal?: boolean
          name?: string
        }
        Relationships: []
      }
      board_notes: {
        Row: {
          author_user_id: string | null
          created_at: string
          expires_at: string | null
          family_id: string
          id: string
          image_url: string | null
          text: string
        }
        Insert: {
          author_user_id?: string | null
          created_at?: string
          expires_at?: string | null
          family_id: string
          id?: string
          image_url?: string | null
          text?: string
        }
        Update: {
          author_user_id?: string | null
          created_at?: string
          expires_at?: string | null
          family_id?: string
          id?: string
          image_url?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_notes_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_connections: {
        Row: {
          access_token_encrypted: string | null
          calendar_id: string | null
          created_at: string
          id: string
          last_synced_at: string | null
          provider: string
          refresh_token_encrypted: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          calendar_id?: string | null
          created_at?: string
          id?: string
          last_synced_at?: string | null
          provider?: string
          refresh_token_encrypted?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          calendar_id?: string | null
          created_at?: string
          id?: string
          last_synced_at?: string | null
          provider?: string
          refresh_token_encrypted?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      caregiver_links: {
        Row: {
          created_at: string
          expires_at: string
          family_id: string
          id: string
          name: string
          token: string
          visible_member_ids: string[]
        }
        Insert: {
          created_at?: string
          expires_at?: string
          family_id: string
          id?: string
          name?: string
          token?: string
          visible_member_ids?: string[]
        }
        Update: {
          created_at?: string
          expires_at?: string
          family_id?: string
          id?: string
          name?: string
          token?: string
          visible_member_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_links_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_progress: {
        Row: {
          challenge_id: string
          count: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          count?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          count?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          boss_creature_type: string | null
          boss_current_hp: number | null
          boss_hp: number | null
          created_at: string
          description: string | null
          end_date: string | null
          family_id: string
          id: string
          is_completed: boolean
          reward_xp: number
          start_date: string
          target_count: number
          title: string
          type: Database["public"]["Enums"]["challenge_type"]
          updated_at: string
        }
        Insert: {
          boss_creature_type?: string | null
          boss_current_hp?: number | null
          boss_hp?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          family_id: string
          id?: string
          is_completed?: boolean
          reward_xp?: number
          start_date?: string
          target_count?: number
          title: string
          type?: Database["public"]["Enums"]["challenge_type"]
          updated_at?: string
        }
        Update: {
          boss_creature_type?: string | null
          boss_current_hp?: number | null
          boss_hp?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          family_id?: string
          id?: string
          is_completed?: boolean
          reward_xp?: number
          start_date?: string
          target_count?: number
          title?: string
          type?: Database["public"]["Enums"]["challenge_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      child_avatars: {
        Row: {
          background: string | null
          created_at: string
          equipped_items: string[]
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          background?: string | null
          created_at?: string
          equipped_items?: string[]
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          background?: string | null
          created_at?: string
          equipped_items?: string[]
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      child_permissions: {
        Row: {
          can_create_events: boolean
          can_create_tasks: boolean
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_create_events?: boolean
          can_create_tasks?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_create_events?: boolean
          can_create_tasks?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companion_creatures: {
        Row: {
          created_at: string
          creature_type: string
          feed_count: number
          hatch_progress: number
          id: string
          is_active: boolean
          name: string | null
          stage: Database["public"]["Enums"]["creature_stage"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creature_type: string
          feed_count?: number
          hatch_progress?: number
          id?: string
          is_active?: boolean
          name?: string | null
          stage?: Database["public"]["Enums"]["creature_stage"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          creature_type?: string
          feed_count?: number
          hatch_progress?: number
          id?: string
          is_active?: boolean
          name?: string | null
          stage?: Database["public"]["Enums"]["creature_stage"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      drop_events: {
        Row: {
          created_at: string
          id: string
          task_id: string | null
          type: Database["public"]["Enums"]["drop_type"]
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          task_id?: string | null
          type: Database["public"]["Enums"]["drop_type"]
          user_id: string
          value?: string
        }
        Update: {
          created_at?: string
          id?: string
          task_id?: string | null
          type?: Database["public"]["Enums"]["drop_type"]
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "drop_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      email_inbox_items: {
        Row: {
          created_at: string
          extracted_date: string | null
          extracted_title: string
          extracted_type: string
          family_id: string
          id: string
          is_processed: boolean
          original_subject: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          extracted_date?: string | null
          extracted_title: string
          extracted_type?: string
          family_id: string
          id?: string
          is_processed?: boolean
          original_subject?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          extracted_date?: string | null
          extracted_title?: string
          extracted_type?: string
          family_id?: string
          id?: string
          is_processed?: boolean
          original_subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_inbox_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          assigned_to_user_ids: string[]
          created_at: string
          created_by_user_id: string | null
          description: string | null
          end_at: string | null
          family_id: string
          icon: string
          id: string
          is_all_day: boolean
          start_at: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to_user_ids?: string[]
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          end_at?: string | null
          family_id: string
          icon?: string
          id?: string
          is_all_day?: boolean
          start_at: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to_user_ids?: string[]
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          end_at?: string | null
          family_id?: string
          icon?: string
          id?: string
          is_all_day?: boolean
          start_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      external_calendar_events: {
        Row: {
          created_at: string
          end_at: string | null
          external_id: string
          family_id: string
          id: string
          is_all_day: boolean
          source: string
          start_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_at?: string | null
          external_id: string
          family_id: string
          id?: string
          is_all_day?: boolean
          source?: string
          start_at: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_at?: string | null
          external_id?: string
          family_id?: string
          id?: string
          is_all_day?: boolean
          source?: string
          start_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_calendar_events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          id: string
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_invites: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          family_id: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string
          family_id: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          family_id?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_invites_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          color: string
          created_at: string
          family_id: string
          id: string
          is_admin: boolean
          managed_by_user_id: string | null
          name: string
          role: Database["public"]["Enums"]["member_role"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          family_id: string
          id?: string
          is_admin?: boolean
          managed_by_user_id?: string | null
          name?: string
          role?: Database["public"]["Enums"]["member_role"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          family_id?: string
          id?: string
          is_admin?: boolean
          managed_by_user_id?: string | null
          name?: string
          role?: Database["public"]["Enums"]["member_role"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_tags: {
        Row: {
          color: string
          created_at: string
          family_id: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          family_id: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          family_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_tags_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      gold_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          item_id: string | null
          item_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          item_id?: string | null
          item_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          item_id?: string | null
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_snapshots: {
        Row: {
          created_at: string
          family_id: string
          id: string
          period: string
          period_start: string
          rank: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          period: string
          period_start: string
          rank?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          period?: string
          period_start?: string
          rank?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_snapshots_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          current_level: number
          id: string
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_level?: number
          id?: string
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_level?: number
          id?: string
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      nudge_rules: {
        Row: {
          child_user_id: string
          created_at: string
          family_id: string
          id: string
          is_enabled: boolean
          parent_alert: boolean
          quiet_end: string | null
          quiet_start: string | null
          times: string[]
          updated_at: string
        }
        Insert: {
          child_user_id: string
          created_at?: string
          family_id: string
          id?: string
          is_enabled?: boolean
          parent_alert?: boolean
          quiet_end?: string | null
          quiet_start?: string | null
          times?: string[]
          updated_at?: string
        }
        Update: {
          child_user_id?: string
          created_at?: string
          family_id?: string
          id?: string
          is_enabled?: boolean
          parent_alert?: boolean
          quiet_end?: string | null
          quiet_start?: string | null
          times?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nudge_rules_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          created_at: string
          gold_awarded: number
          id: string
          reason: string
          task_id: string | null
          user_id: string
          xp_awarded: number
        }
        Insert: {
          created_at?: string
          gold_awarded?: number
          id?: string
          reason?: string
          task_id?: string | null
          user_id: string
          xp_awarded?: number
        }
        Update: {
          created_at?: string
          gold_awarded?: number
          id?: string
          reason?: string
          task_id?: string | null
          user_id?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          locale: string
          name: string
          onboarding_completed: boolean
          pin_hash: string | null
          role: Database["public"]["Enums"]["member_role"]
          sound_enabled: boolean
          sound_volume: number
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          locale?: string
          name?: string
          onboarding_completed?: boolean
          pin_hash?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          sound_enabled?: boolean
          sound_volume?: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          locale?: string
          name?: string
          onboarding_completed?: boolean
          pin_hash?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          sound_enabled?: boolean
          sound_volume?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      reward_fulfillments: {
        Row: {
          child_user_id: string
          created_at: string
          fulfilled_by_user_id: string
          id: string
          reward_id: string
        }
        Insert: {
          child_user_id: string
          created_at?: string
          fulfilled_by_user_id: string
          id?: string
          reward_id: string
        }
        Update: {
          child_user_id?: string
          created_at?: string
          fulfilled_by_user_id?: string
          id?: string
          reward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_fulfillments_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          child_user_id: string | null
          created_at: string
          description: string | null
          family_id: string
          gold_price: number | null
          icon: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
          xp_threshold: number | null
        }
        Insert: {
          child_user_id?: string | null
          created_at?: string
          description?: string | null
          family_id: string
          gold_price?: number | null
          icon?: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          xp_threshold?: number | null
        }
        Update: {
          child_user_id?: string | null
          created_at?: string
          description?: string | null
          family_id?: string
          gold_price?: number | null
          icon?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          xp_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_task_instances: {
        Row: {
          created_at: string
          date: string
          id: string
          position: number
          routine_id: string
          task_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          position?: number
          routine_id: string
          task_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          position?: number
          routine_id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routine_task_instances_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_task_instances_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          assigned_to_user_id: string | null
          created_at: string
          family_id: string
          flow_mode: boolean
          flow_step_order: string[]
          flow_target_minutes: number | null
          id: string
          is_active: boolean
          photo_required: boolean
          title: string
          updated_at: string
          weekdays: number[]
        }
        Insert: {
          assigned_to_user_id?: string | null
          created_at?: string
          family_id: string
          flow_mode?: boolean
          flow_step_order?: string[]
          flow_target_minutes?: number | null
          id?: string
          is_active?: boolean
          photo_required?: boolean
          title: string
          updated_at?: string
          weekdays?: number[]
        }
        Update: {
          assigned_to_user_id?: string | null
          created_at?: string
          family_id?: string
          flow_mode?: boolean
          flow_step_order?: string[]
          flow_target_minutes?: number | null
          id?: string
          is_active?: boolean
          photo_required?: boolean
          title?: string
          updated_at?: string
          weekdays?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "routines_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_items: {
        Row: {
          added_by_user_id: string | null
          category: string
          checked: boolean
          checked_at: string | null
          checked_by_user_id: string | null
          created_at: string
          id: string
          list_id: string
          name: string
          sort_order: number
        }
        Insert: {
          added_by_user_id?: string | null
          category?: string
          checked?: boolean
          checked_at?: string | null
          checked_by_user_id?: string | null
          created_at?: string
          id?: string
          list_id: string
          name: string
          sort_order?: number
        }
        Update: {
          added_by_user_id?: string | null
          category?: string
          checked?: boolean
          checked_at?: string | null
          checked_by_user_id?: string | null
          created_at?: string
          id?: string
          list_id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          family_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_freezes: {
        Row: {
          created_at: string
          id: string
          is_used: boolean
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_used?: boolean
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_used?: boolean
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      streaks: {
        Row: {
          current_count: number
          id: string
          last_activity_date: string | null
          longest_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_count?: number
          id?: string
          last_activity_date?: string | null
          longest_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_count?: number
          id?: string
          last_activity_date?: string | null
          longest_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          app_store_product_id: string | null
          created_at: string
          expires_at: string | null
          family_id: string
          id: string
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          app_store_product_id?: string | null
          created_at?: string
          expires_at?: string | null
          family_id: string
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          app_store_product_id?: string | null
          created_at?: string
          expires_at?: string | null
          family_id?: string
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          created_at: string
          id: string
          task_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          task_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          task_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_completion_photos: {
        Row: {
          created_at: string
          id: string
          photo_url: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_url: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_url?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completion_photos_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_tags: {
        Row: {
          tag_id: string
          task_id: string
        }
        Insert: {
          tag_id: string
          task_id: string
        }
        Update: {
          tag_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "family_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_tags_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to_user_id: string | null
          challenge_id: string | null
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          due_date: string | null
          end_time: string | null
          family_id: string
          icon: string
          id: string
          photo_required: boolean
          priority: Database["public"]["Enums"]["task_priority"]
          start_time: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          visibility: string
          xp_value: number
        }
        Insert: {
          assigned_to_user_id?: string | null
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          due_date?: string | null
          end_time?: string | null
          family_id: string
          icon?: string
          id?: string
          photo_required?: boolean
          priority?: Database["public"]["Enums"]["task_priority"]
          start_time?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          visibility?: string
          xp_value?: number
        }
        Update: {
          assigned_to_user_id?: string | null
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          due_date?: string | null
          end_time?: string | null
          family_id?: string
          icon?: string
          id?: string
          photo_required?: boolean
          priority?: Database["public"]["Enums"]["task_priority"]
          start_time?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          visibility?: string
          xp_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_tasks_challenge"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      time_blocks: {
        Row: {
          created_at: string
          end_time: string
          family_id: string
          id: string
          label: string
          start_time: string
          type: Database["public"]["Enums"]["time_block_type"]
          updated_at: string
          user_id: string | null
          weekdays: number[]
        }
        Insert: {
          created_at?: string
          end_time: string
          family_id: string
          id?: string
          label?: string
          start_time: string
          type: Database["public"]["Enums"]["time_block_type"]
          updated_at?: string
          user_id?: string | null
          weekdays?: number[]
        }
        Update: {
          created_at?: string
          end_time?: string
          family_id?: string
          id?: string
          label?: string
          start_time?: string
          type?: Database["public"]["Enums"]["time_block_type"]
          updated_at?: string
          user_id?: string | null
          weekdays?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "time_blocks_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_recaps: {
        Row: {
          created_at: string
          data: Json
          family_id: string
          id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          data?: Json
          family_id: string
          id?: string
          week_start: string
        }
        Update: {
          created_at?: string
          data?: Json
          family_id?: string
          id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_recaps_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_care_share: {
        Args: { p_family_id: string; p_period: string }
        Returns: {
          completed_count: number
          pct: number
          uid: string
          uname: string
        }[]
      }
      get_gold_balance: { Args: { p_user_id: string }; Returns: number }
      get_leaderboard: {
        Args: { p_family_id: string; p_period: string }
        Returns: {
          pos: number
          pos_change: number
          uid: string
          uname: string
          xp: number
        }[]
      }
      get_user_family_id: { Args: never; Returns: string }
      is_family_admin: { Args: { p_family_id: string }; Returns: boolean }
      is_family_member: { Args: { p_family_id: string }; Returns: boolean }
    }
    Enums: {
      challenge_type: "individual" | "family" | "boss_battle"
      creature_stage: "egg" | "baby" | "juvenile" | "adult"
      drop_type:
        | "bonus_gold"
        | "xp_boost"
        | "avatar_item"
        | "streak_freeze"
        | "mystery_egg"
      event_status: "active" | "pending"
      member_role: "adult" | "child" | "baby"
      subscription_status: "active" | "cancelled" | "expired"
      subscription_tier: "free" | "family" | "familyplus"
      task_priority: "high" | "normal" | "low"
      task_status: "open" | "completed"
      time_block_type: "school" | "work" | "nap" | "unavailable"
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
  public: {
    Enums: {
      challenge_type: ["individual", "family", "boss_battle"],
      creature_stage: ["egg", "baby", "juvenile", "adult"],
      drop_type: [
        "bonus_gold",
        "xp_boost",
        "avatar_item",
        "streak_freeze",
        "mystery_egg",
      ],
      event_status: ["active", "pending"],
      member_role: ["adult", "child", "baby"],
      subscription_status: ["active", "cancelled", "expired"],
      subscription_tier: ["free", "family", "familyplus"],
      task_priority: ["high", "normal", "low"],
      task_status: ["open", "completed"],
      time_block_type: ["school", "work", "nap", "unavailable"],
    },
  },
} as const
