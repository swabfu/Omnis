export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ContentType = 'link' | 'tweet' | 'image' | 'note'
export type ItemStatus = 'inbox' | 'done' | 'archived'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      items: {
        Row: {
          id: string
          user_id: string
          type: ContentType
          url: string | null
          title: string | null
          description: string | null
          content: string | null
          image_path: string | null
          status: ItemStatus
          created_at: string
          embedding: unknown | null
        }
        Insert: {
          id?: string
          user_id: string
          type?: ContentType
          url?: string | null
          title?: string | null
          description?: string | null
          content?: string | null
          image_path?: string | null
          status?: ItemStatus
          created_at?: string
          embedding?: unknown | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: ContentType
          url?: string | null
          title?: string | null
          description?: string | null
          content?: string | null
          image_path?: string | null
          status?: ItemStatus
          created_at?: string
          embedding?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: 'items_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tags_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      item_tags: {
        Row: {
          item_id: string
          tag_id: string
        }
        Insert: {
          item_id: string
          tag_id: string
        }
        Update: {
          item_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'item_tags_item_id_fkey'
            columns: ['item_id']
            referencedRelation: 'items'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'item_tags_tag_id_fkey'
            columns: ['tag_id']
            referencedRelation: 'tags'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      content_type: ContentType
      item_status: ItemStatus
    }
  }
}
