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
          tags: string[];
          is_pinned: boolean;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
          search_vector: unknown;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body?: string;
          tags?: string[];
          is_pinned?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
          search_vector?: never;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          tags?: string[];
          is_pinned?: boolean;
          archived_at?: string | null;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Note = Database["public"]["Tables"]["notes"]["Row"];
