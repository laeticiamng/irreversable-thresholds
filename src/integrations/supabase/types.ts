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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      absence_effects: {
        Row: {
          absence_id: string
          created_at: string
          description: string
          effect_type: Database["public"]["Enums"]["absence_effect_type"]
          id: string
          user_id: string
        }
        Insert: {
          absence_id: string
          created_at?: string
          description: string
          effect_type: Database["public"]["Enums"]["absence_effect_type"]
          id?: string
          user_id: string
        }
        Update: {
          absence_id?: string
          created_at?: string
          description?: string
          effect_type?: Database["public"]["Enums"]["absence_effect_type"]
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "absence_effects_absence_id_fkey"
            columns: ["absence_id"]
            isOneToOne: false
            referencedRelation: "absences"
            referencedColumns: ["id"]
          },
        ]
      }
      absences: {
        Row: {
          case_id: string | null
          category: string | null
          counterfactual: string | null
          created_at: string
          description: string
          evidence_needed: string | null
          id: string
          impact_level: string | null
          title: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          category?: string | null
          counterfactual?: string | null
          created_at?: string
          description: string
          evidence_needed?: string | null
          id?: string
          impact_level?: string | null
          title: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          category?: string | null
          counterfactual?: string | null
          created_at?: string
          description?: string
          evidence_needed?: string | null
          id?: string
          impact_level?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "absences_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          created_at: string
          description: string | null
          domain: string | null
          id: string
          metadata: Json | null
          status: string
          template_id: string | null
          time_horizon: string | null
          title: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          template_id?: string | null
          time_horizon?: string | null
          title: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          template_id?: string | null
          time_horizon?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      exports: {
        Row: {
          case_id: string | null
          created_at: string
          export_type: string
          file_url: string | null
          id: string
          metadata: Json | null
          module: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          export_type: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          module: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string
          export_type?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          module?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exports_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invisible_thresholds: {
        Row: {
          case_id: string | null
          context: string | null
          created_at: string
          description: string
          id: string
          intensity: number | null
          sensed_at: string | null
          tags: string[] | null
          thresh_type: Database["public"]["Enums"]["thresh_type"]
          title: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          context?: string | null
          created_at?: string
          description: string
          id?: string
          intensity?: number | null
          sensed_at?: string | null
          tags?: string[] | null
          thresh_type: Database["public"]["Enums"]["thresh_type"]
          title: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          context?: string | null
          created_at?: string
          description?: string
          id?: string
          intensity?: number | null
          sensed_at?: string | null
          tags?: string[] | null
          thresh_type?: Database["public"]["Enums"]["thresh_type"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invisible_thresholds_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      signals: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          intensity: number | null
          occurred_at: string | null
          signal_type: string
          user_id: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          intensity?: number | null
          occurred_at?: string | null
          signal_type?: string
          user_id: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          intensity?: number | null
          occurred_at?: string | null
          signal_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signals_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      silva_sessions: {
        Row: {
          case_id: string | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "silva_sessions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      silva_spaces: {
        Row: {
          case_id: string | null
          content: string | null
          created_at: string
          format_mode: string
          id: string
          scope: string
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          case_id?: string | null
          content?: string | null
          created_at?: string
          format_mode?: string
          id?: string
          scope: string
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          case_id?: string | null
          content?: string | null
          created_at?: string
          format_mode?: string
          id?: string
          scope?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "silva_spaces_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "silva_spaces_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_premium: boolean
          module: string
          name: string
          slug: string
          structure: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean
          module: string
          name: string
          slug: string
          structure?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean
          module?: string
          name?: string
          slug?: string
          structure?: Json
        }
        Relationships: []
      }
      threshold_consequences: {
        Row: {
          consequence_type: string
          created_at: string
          description: string
          id: string
          threshold_id: string
          user_id: string
        }
        Insert: {
          consequence_type: string
          created_at?: string
          description: string
          id?: string
          threshold_id: string
          user_id: string
        }
        Update: {
          consequence_type?: string
          created_at?: string
          description?: string
          id?: string
          threshold_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "threshold_consequences_threshold_id_fkey"
            columns: ["threshold_id"]
            isOneToOne: false
            referencedRelation: "thresholds"
            referencedColumns: ["id"]
          },
        ]
      }
      thresholds: {
        Row: {
          case_id: string | null
          category: string | null
          conditions: string | null
          created_at: string
          crossed_at: string | null
          description: string
          id: string
          is_crossed: boolean
          notes: string | null
          severity: string | null
          title: string
          user_id: string
          what_cannot_be_undone: string | null
          what_changes_after: string | null
        }
        Insert: {
          case_id?: string | null
          category?: string | null
          conditions?: string | null
          created_at?: string
          crossed_at?: string | null
          description: string
          id?: string
          is_crossed?: boolean
          notes?: string | null
          severity?: string | null
          title: string
          user_id: string
          what_cannot_be_undone?: string | null
          what_changes_after?: string | null
        }
        Update: {
          case_id?: string | null
          category?: string | null
          conditions?: string | null
          created_at?: string
          crossed_at?: string | null
          description?: string
          id?: string
          is_crossed?: boolean
          notes?: string | null
          severity?: string | null
          title?: string
          user_id?: string
          what_cannot_be_undone?: string | null
          what_changes_after?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thresholds_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_workspace_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_workspace_roles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_personal: boolean
          name: string
          owner_id: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_personal?: boolean
          name: string
          owner_id: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_personal?: boolean
          name?: string
          owner_id?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_workspace_role: {
        Args: {
          _roles: Database["public"]["Enums"]["workspace_role"][]
          _user_id: string
          _workspace_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      absence_effect_type: "prevents" | "enables" | "forces" | "preserves"
      thresh_type:
        | "trop"
        | "pas_assez"
        | "rupture"
        | "evidence"
        | "saturation"
        | "acceptabilite"
        | "tolerance"
      workspace_role: "owner" | "admin" | "editor" | "viewer"
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
      absence_effect_type: ["prevents", "enables", "forces", "preserves"],
      thresh_type: [
        "trop",
        "pas_assez",
        "rupture",
        "evidence",
        "saturation",
        "acceptabilite",
        "tolerance",
      ],
      workspace_role: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const
