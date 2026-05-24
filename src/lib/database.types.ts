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
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          is_pinned: boolean;
          archived_at: string | null;
          trashed_at: string | null;
          created_at: string;
          updated_at: string;
          search_vector: unknown;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body?: string;
          is_pinned?: boolean;
          archived_at?: string | null;
          trashed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          search_vector?: never;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          is_pinned?: boolean;
          archived_at?: string | null;
          trashed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          search_vector?: never;
        };
        Relationships: [
          {
            foreignKeyName: "notes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      note_tags: {
        Row: {
          note_id: string;
          tag_id: string;
        };
        Insert: {
          note_id: string;
          tag_id: string;
        };
        Update: {
          note_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "note_tags_note_id_fkey";
            columns: ["note_id"];
            isOneToOne: false;
            referencedRelation: "notes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "note_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
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

export type Note = Database["public"]["Tables"]["notes"]["Row"] & {
  tags: string[];
};
