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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
