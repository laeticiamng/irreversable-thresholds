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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
          {
            foreignKeyName: "absences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_activity_log: {
        Row: {
          accepted_items: Json | null
          action: string
          case_id: string | null
          created_at: string
          id: string
          input_snapshot: Json
          module: string
          output_snapshot: Json
          rejected_items: Json | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          accepted_items?: Json | null
          action: string
          case_id?: string | null
          created_at?: string
          id?: string
          input_snapshot?: Json
          module: string
          output_snapshot?: Json
          rejected_items?: Json | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          accepted_items?: Json | null
          action?: string
          case_id?: string | null
          created_at?: string
          id?: string
          input_snapshot?: Json
          module?: string
          output_snapshot?: Json
          rejected_items?: Json | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_activity_log_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_activity_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      case_collaborators: {
        Row: {
          accepted_at: string | null
          case_id: string
          id: string
          invited_at: string
          invited_by: string
          role: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          case_id: string
          id?: string
          invited_at?: string
          invited_by: string
          role?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          case_id?: string
          id?: string
          invited_at?: string
          invited_by?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_collaborators_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_tags: {
        Row: {
          case_id: string
          created_at: string
          id: string
          tag_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          tag_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_tags_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
          {
            foreignKeyName: "invisible_thresholds_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          case_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          module: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          case_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          module?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          case_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          module?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          plan: string
          settings: Json | null
          slug: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          plan?: string
          settings?: Json | null
          slug: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          plan?: string
          settings?: Json | null
          slug?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
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
          organization_id: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          organization_id?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          organization_id?: string | null
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
          {
            foreignKeyName: "silva_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "silva_spaces_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
          {
            foreignKeyName: "thresholds_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          default_module: string | null
          display_density: string | null
          email_notifications: boolean | null
          id: string
          notifications_enabled: boolean | null
          show_animations: boolean | null
          sound_enabled: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_module?: string | null
          display_density?: string | null
          email_notifications?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          show_animations?: boolean | null
          sound_enabled?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_module?: string | null
          display_density?: string | null
          email_notifications?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          show_animations?: boolean | null
          sound_enabled?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          ai_actions_reset_at: string | null
          ai_actions_used: number
          created_at: string
          expires_at: string | null
          id: string
          plan: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_actions_reset_at?: string | null
          ai_actions_used?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_actions_reset_at?: string | null
          ai_actions_used?: number
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
      user_belongs_to_org: { Args: { _org_id: string }; Returns: boolean }
      user_has_org_role: {
        Args: {
          _org_id: string
          _roles: Database["public"]["Enums"]["org_role"][]
        }
        Returns: boolean
      }
      user_org_role: {
        Args: { _org_id: string }
        Returns: Database["public"]["Enums"]["org_role"]
      }
    }
    Enums: {
      absence_effect_type: "prevents" | "enables" | "forces" | "preserves"
      org_role: "owner" | "admin" | "member" | "viewer"
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
      org_role: ["owner", "admin", "member", "viewer"],
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
