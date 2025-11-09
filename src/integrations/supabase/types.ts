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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string
          category: string
          category_mn: string
          content: string
          content_mn: string
          created_at: string
          excerpt: string
          excerpt_mn: string
          featured_image: string | null
          id: string
          published: boolean
          slug: string
          title: string
          title_mn: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author_id: string
          category: string
          category_mn: string
          content: string
          content_mn: string
          created_at?: string
          excerpt: string
          excerpt_mn: string
          featured_image?: string | null
          id?: string
          published?: boolean
          slug: string
          title: string
          title_mn: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author_id?: string
          category?: string
          category_mn?: string
          content?: string
          content_mn?: string
          created_at?: string
          excerpt?: string
          excerpt_mn?: string
          featured_image?: string | null
          id?: string
          published?: boolean
          slug?: string
          title?: string
          title_mn?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      carts: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          items: Json
          owner_id: string
          payment_reference: string | null
          qr_code_url: string | null
          status: Database["public"]["Enums"]["cart_status"]
          total: number
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          items?: Json
          owner_id: string
          payment_reference?: string | null
          qr_code_url?: string | null
          status?: Database["public"]["Enums"]["cart_status"]
          total?: number
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          items?: Json
          owner_id?: string
          payment_reference?: string | null
          qr_code_url?: string | null
          status?: Database["public"]["Enums"]["cart_status"]
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          description_mn: string | null
          id: string
          name: string
          name_mn: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_mn?: string | null
          id?: string
          name: string
          name_mn: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_mn?: string | null
          id?: string
          name?: string
          name_mn?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          contact_info: string | null
          created_at: string | null
          employee_count: number
          id: string
          location: string
          name: string
          owner_user_id: string
          purpose: string
          training_frequency: Database["public"]["Enums"]["training_frequency"]
          updated_at: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          employee_count: number
          id?: string
          location: string
          name: string
          owner_user_id: string
          purpose: string
          training_frequency?: Database["public"]["Enums"]["training_frequency"]
          updated_at?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          employee_count?: number
          id?: string
          location?: string
          name?: string
          owner_user_id?: string
          purpose?: string
          training_frequency?: Database["public"]["Enums"]["training_frequency"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          subscribed: boolean
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          subscribed?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          subscribed?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          bio_mn: string | null
          browsed_video_ids: string[] | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          liked_video_ids: string[] | null
          professional_title: string | null
          professional_title_mn: string | null
          reviews_count: number | null
          updated_at: string
          years_of_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bio_mn?: string | null
          browsed_video_ids?: string[] | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          liked_video_ids?: string[] | null
          professional_title?: string | null
          professional_title_mn?: string | null
          reviews_count?: number | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bio_mn?: string | null
          browsed_video_ids?: string[] | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          liked_video_ids?: string[] | null
          professional_title?: string | null
          professional_title_mn?: string | null
          reviews_count?: number | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Relationships: []
      }
      purchased_videos: {
        Row: {
          cart_id: string | null
          id: string
          purchased_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          cart_id?: string | null
          id?: string
          purchased_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          cart_id?: string | null
          id?: string
          purchased_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchased_videos_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchased_videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchased_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "training_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      question_answers: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_best_answer: boolean
          question_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_best_answer?: boolean
          question_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_best_answer?: boolean
          question_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string | null
          id: string
          stars: number
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          stars: number
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          stars?: number
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "training_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          discount_percentage: number
          id: string
          is_active: boolean
          total_earnings: number
          total_referrals: number
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          discount_percentage?: number
          id?: string
          is_active?: boolean
          total_earnings?: number
          total_referrals?: number
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          discount_percentage?: number
          id?: string
          is_active?: boolean
          total_earnings?: number
          total_referrals?: number
          user_id?: string
        }
        Relationships: []
      }
      referral_uses: {
        Row: {
          commission_earned: number
          created_at: string
          id: string
          purchase_amount: number
          referral_code_id: string
          referred_user_id: string
        }
        Insert: {
          commission_earned?: number
          created_at?: string
          id?: string
          purchase_amount?: number
          referral_code_id: string
          referred_user_id: string
        }
        Update: {
          commission_earned?: number
          created_at?: string
          id?: string
          purchase_amount?: number
          referral_code_id?: string
          referred_user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string | null
          id: string
          moderated: boolean | null
          text: string
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          moderated?: boolean | null
          text: string
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          moderated?: boolean | null
          text?: string
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "training_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_applications: {
        Row: {
          bio: string
          created_at: string
          experience: string
          full_name: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bio: string
          created_at?: string
          experience: string
          full_name: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string
          created_at?: string
          experience?: string
          full_name?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_videos: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_free: boolean | null
          is_private_link_validated: boolean | null
          price: number | null
          size_mb: number | null
          status: Database["public"]["Enums"]["training_status"]
          title: string
          trainer_id: string
          updated_at: string
          youtube_url: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_free?: boolean | null
          is_private_link_validated?: boolean | null
          price?: number | null
          size_mb?: number | null
          status?: Database["public"]["Enums"]["training_status"]
          title: string
          trainer_id: string
          updated_at?: string
          youtube_url: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_free?: boolean | null
          is_private_link_validated?: boolean | null
          price?: number | null
          size_mb?: number | null
          status?: Database["public"]["Enums"]["training_status"]
          title?: string
          trainer_id?: string
          updated_at?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_videos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_videos_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_progress: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          last_watched_at: string
          progress_percentage: number
          updated_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          last_watched_at?: string
          progress_percentage?: number
          updated_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          last_watched_at?: string
          progress_percentage?: number
          updated_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: []
      }
      video_questions: {
        Row: {
          created_at: string
          id: string
          is_answered: boolean
          question: string
          updated_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_answered?: boolean
          question: string
          updated_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_answered?: boolean
          question?: string
          updated_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: []
      }
      video_views: {
        Row: {
          id: string
          user_id: string
          video_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_views_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "training_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "trainer"
      cart_status: "open" | "paid" | "cancelled"
      training_frequency: "weekly" | "monthly" | "quarterly" | "yearly"
      training_status: "uploaded" | "pending" | "approved" | "rejected"
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
      app_role: ["admin", "user", "trainer"],
      cart_status: ["open", "paid", "cancelled"],
      training_frequency: ["weekly", "monthly", "quarterly", "yearly"],
      training_status: ["uploaded", "pending", "approved", "rejected"],
    },
  },
} as const
