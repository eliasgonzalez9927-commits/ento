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
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          role?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          owner_id: string | null;
          title: string;
          description: string | null;
          location: string | null;
          city: string | null;
          event_date: string;
          capacity: number;
          is_public: boolean | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          title: string;
          description?: string | null;
          location?: string | null;
          city?: string | null;
          event_date: string;
          capacity: number;
          is_public?: boolean | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          title?: string;
          description?: string | null;
          location?: string | null;
          city?: string | null;
          event_date?: string;
          capacity?: number;
          is_public?: boolean | null;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      tickets: {
        Row: {
          id: string;
          event_id: string | null;
          user_id: string | null;
          tier_name: string | null;
          price: number;
          secret_seed: string;
          status: string | null;
          scanned_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          user_id?: string | null;
          tier_name?: string | null;
          price: number;
          secret_seed: string;
          status?: string | null;
          scanned_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string | null;
          user_id?: string | null;
          tier_name?: string | null;
          price?: number;
          secret_seed?: string;
          status?: string | null;
          scanned_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tickets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      ticket_tiers: {
        Row: {
          id: string;
          event_id: string | null;
          name: string;
          price: number;
          capacity: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          name: string;
          price: number;
          capacity: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string | null;
          name?: string;
          price?: number;
          capacity?: number;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ticket_tiers_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      wallet_ledgers: {
        Row: {
          id: string;
          user_id: string | null;
          event_id: string | null;
          transaction_type: string | null;
          amount: number;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_id?: string | null;
          transaction_type?: string | null;
          amount: number;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_id?: string | null;
          transaction_type?: string | null;
          amount?: number;
          description?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "wallet_ledgers_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wallet_ledgers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      promoter_tracking: {
        Row: {
          id: string;
          promoter_id: string | null;
          event_id: string | null;
          ticket_id: string | null;
          commission_earned: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          promoter_id?: string | null;
          event_id?: string | null;
          ticket_id?: string | null;
          commission_earned: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          promoter_id?: string | null;
          event_id?: string | null;
          ticket_id?: string | null;
          commission_earned?: number;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "promoter_tracking_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promoter_tracking_promoter_id_fkey";
            columns: ["promoter_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promoter_tracking_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
