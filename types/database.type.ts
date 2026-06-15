export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "admin" | "team_member" | "client";
export type AccountStatus = "active" | "inactive";
export type ProjectStatus = "not_started" | "in_progress" | "completed" | "on_hold";
export type TaskStatus = "todo" | "in_progress" | "completed" | "blocked";
export type NotificationStatus = "pending" | "sent" | "failed";
export type ToolKey = "qr_generator" | "background_remover";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string | null;
          email: string;
          role: UserRole;
          client_id: string | null;
          account_status: AccountStatus;
          tool_tokens: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name?: string | null;
          email: string;
          role: UserRole;
          client_id?: string | null;
          account_status?: AccountStatus;
          tool_tokens?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string | null;
          full_name?: string | null;
          email?: string;
          role?: UserRole;
          client_id?: string | null;
          account_status?: AccountStatus;
          tool_tokens?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          company_name: string;
          contact_person: string | null;
          email: string;
          phone_number: string | null;
          created_by_profile_id: string | null;
          login_access: boolean;
          account_status: AccountStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          contact_person?: string | null;
          email: string;
          phone_number?: string | null;
          created_by_profile_id?: string | null;
          login_access?: boolean;
          account_status?: AccountStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company_name?: string;
          contact_person?: string | null;
          email?: string;
          phone_number?: string | null;
          created_by_profile_id?: string | null;
          login_access?: boolean;
          account_status?: AccountStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          project_name: string;
          description: string | null;
          start_date: string | null;
          due_date: string | null;
          status: ProjectStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          project_name: string;
          description?: string | null;
          start_date?: string | null;
          due_date?: string | null;
          status?: ProjectStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          project_name?: string;
          description?: string | null;
          start_date?: string | null;
          due_date?: string | null;
          status?: ProjectStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_assignments: {
        Row: {
          id: string;
          project_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          profile_id: string;
          created_at?: string;
        };
        Update: {
          project_id?: string;
          profile_id?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          assigned_to_profile_id: string | null;
          task_name: string;
          description: string | null;
          due_date: string | null;
          status: TaskStatus;
          final_link: string | null;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          assigned_to_profile_id?: string | null;
          task_name: string;
          description?: string | null;
          due_date?: string | null;
          status?: TaskStatus;
          final_link?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          project_id?: string;
          assigned_to_profile_id?: string | null;
          task_name?: string;
          description?: string | null;
          due_date?: string | null;
          status?: TaskStatus;
          final_link?: string | null;
          internal_notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_events: {
        Row: {
          id: string;
          task_id: string;
          event_type: string;
          recipient_email: string;
          status: NotificationStatus;
          created_at: string;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          task_id: string;
          event_type: string;
          recipient_email: string;
          status?: NotificationStatus;
          created_at?: string;
          sent_at?: string | null;
        };
        Update: {
          event_type?: string;
          recipient_email?: string;
          status?: NotificationStatus;
          sent_at?: string | null;
        };
        Relationships: [];
      };
      tool_download_events: {
        Row: {
          id: string;
          profile_id: string;
          tool: ToolKey;
          tokens_spent: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          tool: ToolKey;
          tokens_spent: number;
          created_at?: string;
        };
        Update: {
          profile_id?: string;
          tool?: ToolKey;
          tokens_spent?: number;
        };
        Relationships: [];
      };
      tool_settings: {
        Row: {
          id: string;
          default_client_tokens: number;
          qr_download_cost: number;
          background_remover_download_cost: number;
          price_per_10_tokens_rm: number;
          bank_name: string;
          bank_account_number: string;
          bank_account_name: string;
          whatsapp_number: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          default_client_tokens?: number;
          qr_download_cost?: number;
          background_remover_download_cost?: number;
          price_per_10_tokens_rm?: number;
          bank_name?: string;
          bank_account_number?: string;
          bank_account_name?: string;
          whatsapp_number?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          default_client_tokens?: number;
          qr_download_cost?: number;
          background_remover_download_cost?: number;
          price_per_10_tokens_rm?: number;
          bank_name?: string;
          bank_account_number?: string;
          bank_account_name?: string;
          whatsapp_number?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      tool_download_counts: {
        Row: {
          profile_id: string | null;
          qr_download_count: number | null;
          background_remover_download_count: number | null;
          total_download_count: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
