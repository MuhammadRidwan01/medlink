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
  clinical: {
    Tables: {
      approvals: {
        Row: {
          created_at: string
          id: number
          note: string | null
          prescription_id: string
          role: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: number
          note?: string | null
          prescription_id: string
          role: string
          status: string
        }
        Update: {
          created_at?: string
          id?: number
          note?: string | null
          prescription_id?: string
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_orders: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          name: string | null
          note: string | null
          patient_id: string
          priority: string | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          name?: string | null
          note?: string | null
          patient_id: string
          priority?: string | null
          status: string
          type: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          name?: string | null
          note?: string | null
          patient_id?: string
          priority?: string | null
          status?: string
          type?: string
        }
        Relationships: []
      }
      prescription_items: {
        Row: {
          duration: string | null
          frequency: string | null
          id: number
          name: string | null
          notes: string | null
          prescription_id: string
          strength: string | null
        }
        Insert: {
          duration?: string | null
          frequency?: string | null
          id?: number
          name?: string | null
          notes?: string | null
          prescription_id: string
          strength?: string | null
        }
        Update: {
          duration?: string | null
          frequency?: string | null
          id?: number
          name?: string | null
          notes?: string | null
          prescription_id?: string
          strength?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      triage_messages: {
        Row: {
          content: string
          created_at: string
          id: number
          metadata: Json
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          metadata?: Json
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          metadata?: Json
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "triage_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "triage_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      triage_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          doctor_id: string | null
          id: string
          patient_id: string
          risk_level: string | null
          status: string
          summary: Json
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          patient_id: string
          risk_level?: string | null
          status?: string
          summary?: Json
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          patient_id?: string
          risk_level?: string | null
          status?: string
          summary?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  commerce: {
    Tables: {
      cart_items: {
        Row: {
          cart_id: string
          id: number
          product_id: string
          qty: number | null
        }
        Insert: {
          cart_id: string
          id?: number
          product_id: string
          qty?: number | null
        }
        Update: {
          cart_id?: string
          id?: number
          product_id?: string
          qty?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: number
          order_id: string
          price: number | null
          product_id: string
          qty: number | null
        }
        Insert: {
          id?: number
          order_id: string
          price?: number | null
          product_id: string
          qty?: number | null
        }
        Update: {
          id?: number
          order_id?: string
          price?: number | null
          product_id?: string
          qty?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          status: string
          total: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status: string
          total?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          total?: number | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          channel: string | null
          created_at: string
          id: string
          order_id: string | null
          snap_token: string | null
          status: string
          user_id: string
        }
        Insert: {
          channel?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          snap_token?: string | null
          status: string
          user_id: string
        }
        Update: {
          channel?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          snap_token?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          contraindications: string[] | null
          created_at: string
          description: string | null
          id: string
          price: number | null
          slug: string
          stock: number | null
          title: string | null
        }
        Insert: {
          contraindications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          price?: number | null
          slug: string
          stock?: number | null
          title?: string | null
        }
        Update: {
          contraindications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          price?: number | null
          slug?: string
          stock?: number | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      allergies: {
        Row: {
          created_at: string | null
          id: number
          reaction: string | null
          severity: string | null
          substance: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          reaction?: string | null
          severity?: string | null
          substance: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          reaction?: string | null
          severity?: string | null
          substance?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "allergies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drug_interactions: {
        Row: {
          a: string
          b: string
          id: number
          note: string | null
          severity: string
        }
        Insert: {
          a: string
          b: string
          id?: number
          note?: string | null
          severity: string
        }
        Update: {
          a?: string
          b?: string
          id?: number
          note?: string | null
          severity?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          atc_code: string | null
          created_at: string | null
          generic_name: string | null
          id: string
          name: string
        }
        Insert: {
          atc_code?: string | null
          created_at?: string | null
          generic_name?: string | null
          id?: string
          name: string
        }
        Update: {
          atc_code?: string | null
          created_at?: string | null
          generic_name?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      meds: {
        Row: {
          created_at: string | null
          frequency: string | null
          id: number
          name: string
          status: string
          strength: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          frequency?: string | null
          id?: number
          name: string
          status?: string
          strength?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          frequency?: string | null
          id?: number
          name?: string
          status?: string
          strength?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacies: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          blood_type: string | null
          created_at: string | null
          dob: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          sex: string | null
        }
        Insert: {
          address?: string | null
          blood_type?: string | null
          created_at?: string | null
          dob?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          sex?: string | null
        }
        Update: {
          address?: string | null
          blood_type?: string | null
          created_at?: string | null
          dob?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          sex?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  clinical: {
    Enums: {},
  },
  commerce: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
