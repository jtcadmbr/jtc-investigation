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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      boards: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cameras_investigacao: {
        Row: {
          created_at: string
          data: string | null
          existe_gravacao: boolean
          horario_aproximado: string | null
          id: string
          investigacao_id: string
          local: string
          observacoes: string | null
          user_id: string
          videos: Json
        }
        Insert: {
          created_at?: string
          data?: string | null
          existe_gravacao?: boolean
          horario_aproximado?: string | null
          id?: string
          investigacao_id: string
          local: string
          observacoes?: string | null
          user_id: string
          videos?: Json
        }
        Update: {
          created_at?: string
          data?: string | null
          existe_gravacao?: boolean
          horario_aproximado?: string | null
          id?: string
          investigacao_id?: string
          local?: string
          observacoes?: string | null
          user_id?: string
          videos?: Json
        }
        Relationships: [
          {
            foreignKeyName: "cameras_investigacao_investigacao_id_fkey"
            columns: ["investigacao_id"]
            isOneToOne: false
            referencedRelation: "investigacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          board_id: string | null
          cor: string | null
          created_at: string
          from_id: string
          id: string
          rotulo: string | null
          texto: string | null
          to_id: string
          user_id: string
        }
        Insert: {
          board_id?: string | null
          cor?: string | null
          created_at?: string
          from_id: string
          id?: string
          rotulo?: string | null
          texto?: string | null
          to_id: string
          user_id: string
        }
        Update: {
          board_id?: string | null
          cor?: string | null
          created_at?: string
          from_id?: string
          id?: string
          rotulo?: string | null
          texto?: string | null
          to_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "investigateds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "investigateds"
            referencedColumns: ["id"]
          },
        ]
      }
      evidencias: {
        Row: {
          adicionado_por: string | null
          created_at: string
          data: string | null
          descricao: string | null
          id: string
          investigacao_id: string
          mime: string | null
          nome: string
          origem: string | null
          status_verificacao: string
          storage_path: string | null
          tipo: string
          url: string | null
          user_id: string
        }
        Insert: {
          adicionado_por?: string | null
          created_at?: string
          data?: string | null
          descricao?: string | null
          id?: string
          investigacao_id: string
          mime?: string | null
          nome: string
          origem?: string | null
          status_verificacao?: string
          storage_path?: string | null
          tipo?: string
          url?: string | null
          user_id: string
        }
        Update: {
          adicionado_por?: string | null
          created_at?: string
          data?: string | null
          descricao?: string | null
          id?: string
          investigacao_id?: string
          mime?: string | null
          nome?: string
          origem?: string | null
          status_verificacao?: string
          storage_path?: string | null
          tipo?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidencias_investigacao_id_fkey"
            columns: ["investigacao_id"]
            isOneToOne: false
            referencedRelation: "investigacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      face_embeddings: {
        Row: {
          age: number | null
          box_h: number | null
          box_w: number | null
          box_x: number | null
          box_y: number | null
          created_at: string
          detector_score: number | null
          embedding: number[]
          face_index: number
          gender: string | null
          gender_probability: number | null
          id: string
          investigated_id: string
          model_version: string
          photo_url: string
          quality: number | null
          user_id: string
        }
        Insert: {
          age?: number | null
          box_h?: number | null
          box_w?: number | null
          box_x?: number | null
          box_y?: number | null
          created_at?: string
          detector_score?: number | null
          embedding: number[]
          face_index?: number
          gender?: string | null
          gender_probability?: number | null
          id?: string
          investigated_id: string
          model_version: string
          photo_url: string
          quality?: number | null
          user_id: string
        }
        Update: {
          age?: number | null
          box_h?: number | null
          box_w?: number | null
          box_x?: number | null
          box_y?: number | null
          created_at?: string
          detector_score?: number | null
          embedding?: number[]
          face_index?: number
          gender?: string | null
          gender_probability?: number | null
          id?: string
          investigated_id?: string
          model_version?: string
          photo_url?: string
          quality?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "face_embeddings_investigated_id_fkey"
            columns: ["investigated_id"]
            isOneToOne: false
            referencedRelation: "investigateds"
            referencedColumns: ["id"]
          },
        ]
      }
      face_feedback: {
        Row: {
          confidence: number
          created_at: string
          decision: string
          distance: number
          id: string
          investigated_id: string
          query_embedding: number[]
          user_id: string
        }
        Insert: {
          confidence: number
          created_at?: string
          decision: string
          distance: number
          id?: string
          investigated_id: string
          query_embedding: number[]
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          decision?: string
          distance?: number
          id?: string
          investigated_id?: string
          query_embedding?: number[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "face_feedback_investigated_id_fkey"
            columns: ["investigated_id"]
            isOneToOne: false
            referencedRelation: "investigateds"
            referencedColumns: ["id"]
          },
        ]
      }
      investigacao_historico: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          investigacao_id: string
          tipo: string
          user_id: string
          usuario: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          investigacao_id: string
          tipo?: string
          user_id: string
          usuario?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          investigacao_id?: string
          tipo?: string
          user_id?: string
          usuario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investigacao_historico_investigacao_id_fkey"
            columns: ["investigacao_id"]
            isOneToOne: false
            referencedRelation: "investigacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      investigacao_pessoas: {
        Row: {
          created_at: string
          id: string
          investigacao_id: string
          investigated_id: string
          observacoes: string | null
          tipo_relacao: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          investigacao_id: string
          investigated_id: string
          observacoes?: string | null
          tipo_relacao?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          investigacao_id?: string
          investigated_id?: string
          observacoes?: string | null
          tipo_relacao?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investigacao_pessoas_investigacao_id_fkey"
            columns: ["investigacao_id"]
            isOneToOne: false
            referencedRelation: "investigacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investigacao_pessoas_investigated_id_fkey"
            columns: ["investigated_id"]
            isOneToOne: false
            referencedRelation: "investigateds"
            referencedColumns: ["id"]
          },
        ]
      }
      investigacoes: {
        Row: {
          created_at: string
          data_abertura: string | null
          descricao: string | null
          id: string
          numero: string
          observacoes: string | null
          prioridade: string
          status: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_abertura?: string | null
          descricao?: string | null
          id?: string
          numero: string
          observacoes?: string | null
          prioridade?: string
          status?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_abertura?: string | null
          descricao?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          prioridade?: string
          status?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investigateds: {
        Row: {
          avo_materna: string | null
          avo_materno: string | null
          avo_paterna: string | null
          avo_paterno: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          data_obito: string | null
          descricao: string | null
          documentos: Json
          email: string | null
          emails: Json
          endereco: string | null
          estado: string | null
          facebook: string | null
          foto_url: string | null
          fotos: Json
          id: string
          idade: number | null
          instagram: string | null
          irmaos: string | null
          irmas: string | null
          linkedin: string | null
          nome: string
          nome_mae: string | null
          nome_pai: string | null
          obito: boolean
          observacoes: string | null
          outras_redes: string | null
          pais: string | null
          rg: string | null
          status: string
          telefone: string | null
          telefones: Json
          tias: string | null
          tiktok: string | null
          tios: string | null
          twitter: string | null
          updated_at: string
          user_id: string
          youtube: string | null
        }
        Insert: {
          avo_materna?: string | null
          avo_materno?: string | null
          avo_paterna?: string | null
          avo_paterno?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          data_obito?: string | null
          descricao?: string | null
          documentos?: Json
          email?: string | null
          emails?: Json
          endereco?: string | null
          estado?: string | null
          facebook?: string | null
          foto_url?: string | null
          fotos?: Json
          id?: string
          idade?: number | null
          instagram?: string | null
          irmaos?: string | null
          irmas?: string | null
          linkedin?: string | null
          nome: string
          nome_mae?: string | null
          nome_pai?: string | null
          obito?: boolean
          observacoes?: string | null
          outras_redes?: string | null
          pais?: string | null
          rg?: string | null
          status?: string
          telefone?: string | null
          telefones?: Json
          tias?: string | null
          tiktok?: string | null
          tios?: string | null
          twitter?: string | null
          updated_at?: string
          user_id: string
          youtube?: string | null
        }
        Update: {
          avo_materna?: string | null
          avo_materno?: string | null
          avo_paterna?: string | null
          avo_paterno?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          data_obito?: string | null
          descricao?: string | null
          documentos?: Json
          email?: string | null
          emails?: Json
          endereco?: string | null
          estado?: string | null
          facebook?: string | null
          foto_url?: string | null
          fotos?: Json
          id?: string
          idade?: number | null
          instagram?: string | null
          irmaos?: string | null
          irmas?: string | null
          linkedin?: string | null
          nome?: string
          nome_mae?: string | null
          nome_pai?: string | null
          obito?: boolean
          observacoes?: string | null
          outras_redes?: string | null
          pais?: string | null
          rg?: string | null
          status?: string
          telefone?: string | null
          telefones?: Json
          tias?: string | null
          tiktok?: string | null
          tios?: string | null
          twitter?: string | null
          updated_at?: string
          user_id?: string
          youtube?: string | null
        }
        Relationships: []
      }
      notas_investigacao: {
        Row: {
          autor: string | null
          created_at: string
          id: string
          investigacao_id: string
          texto: string
          updated_at: string
          user_id: string
        }
        Insert: {
          autor?: string | null
          created_at?: string
          id?: string
          investigacao_id: string
          texto: string
          updated_at?: string
          user_id: string
        }
        Update: {
          autor?: string | null
          created_at?: string
          id?: string
          investigacao_id?: string
          texto?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notas_investigacao_investigacao_id_fkey"
            columns: ["investigacao_id"]
            isOneToOne: false
            referencedRelation: "investigacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_nodes: {
        Row: {
          board_id: string
          created_at: string
          id: string
          investigated_id: string
          pos_x: number
          pos_y: number
          user_id: string
        }
        Insert: {
          board_id: string
          created_at?: string
          id?: string
          investigated_id: string
          pos_x?: number
          pos_y?: number
          user_id: string
        }
        Update: {
          board_id?: string
          created_at?: string
          id?: string
          investigated_id?: string
          pos_x?: number
          pos_y?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "panel_nodes_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_nodes_investigated_id_fkey"
            columns: ["investigated_id"]
            isOneToOne: false
            referencedRelation: "investigateds"
            referencedColumns: ["id"]
          },
        ]
      }
      relatos: {
        Row: {
          autor_fonte: string | null
          created_at: string
          data: string | null
          hora: string | null
          id: string
          investigacao_id: string
          observacoes: string | null
          status_verificacao: string
          texto: string
          tipo: string
          user_id: string
        }
        Insert: {
          autor_fonte?: string | null
          created_at?: string
          data?: string | null
          hora?: string | null
          id?: string
          investigacao_id: string
          observacoes?: string | null
          status_verificacao?: string
          texto: string
          tipo?: string
          user_id: string
        }
        Update: {
          autor_fonte?: string | null
          created_at?: string
          data?: string | null
          hora?: string | null
          id?: string
          investigacao_id?: string
          observacoes?: string | null
          status_verificacao?: string
          texto?: string
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relatos_investigacao_id_fkey"
            columns: ["investigacao_id"]
            isOneToOne: false
            referencedRelation: "investigacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      share_links: {
        Row: {
          created_at: string
          expires_at: string
          fields: Json
          id: string
          investigated_id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          fields?: Json
          id?: string
          investigated_id: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          fields?: Json
          id?: string
          investigated_id?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_links_investigated_id_fkey"
            columns: ["investigated_id"]
            isOneToOne: false
            referencedRelation: "investigateds"
            referencedColumns: ["id"]
          },
        ]
      }
      smtp_configs: {
        Row: {
          created_at: string | null
          from_email: string
          from_name: string
          host: string
          id: string
          is_active: boolean | null
          password: string
          port: number
          purpose: Database["public"]["Enums"]["email_purpose"]
          updated_at: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string | null
          from_email: string
          from_name: string
          host: string
          id?: string
          is_active?: boolean | null
          password: string
          port: number
          purpose?: Database["public"]["Enums"]["email_purpose"]
          updated_at?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string | null
          from_email?: string
          from_name?: string
          host?: string
          id?: string
          is_active?: boolean | null
          password?: string
          port?: number
          purpose?: Database["public"]["Enums"]["email_purpose"]
          updated_at?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      testemunhas: {
        Row: {
          created_at: string
          data_relato: string | null
          estava_presente: boolean
          foto_storage_path: string | null
          foto_url: string | null
          id: string
          idade: number | null
          investigacao_id: string
          local_estava: string | null
          nome: string
          o_que_lembra: string | null
          o_que_nao_tem_certeza: string | null
          observacoes: string | null
          ouviu_pessoalmente: boolean
          relato: string | null
          updated_at: string
          user_id: string
          video_storage_path: string | null
          video_url: string | null
          viu_pessoalmente: boolean
        }
        Insert: {
          created_at?: string
          data_relato?: string | null
          estava_presente?: boolean
          foto_storage_path?: string | null
          foto_url?: string | null
          id?: string
          idade?: number | null
          investigacao_id: string
          local_estava?: string | null
          nome: string
          o_que_lembra?: string | null
          o_que_nao_tem_certeza?: string | null
          observacoes?: string | null
          ouviu_pessoalmente?: boolean
          relato?: string | null
          updated_at?: string
          user_id: string
          video_storage_path?: string | null
          video_url?: string | null
          viu_pessoalmente?: boolean
        }
        Update: {
          created_at?: string
          data_relato?: string | null
          estava_presente?: boolean
          foto_storage_path?: string | null
          foto_url?: string | null
          id?: string
          idade?: number | null
          investigacao_id?: string
          local_estava?: string | null
          nome?: string
          o_que_lembra?: string | null
          o_que_nao_tem_certeza?: string | null
          observacoes?: string | null
          ouviu_pessoalmente?: boolean
          relato?: string | null
          updated_at?: string
          user_id?: string
          video_storage_path?: string | null
          video_url?: string | null
          viu_pessoalmente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "testemunhas_investigacao_id_fkey"
            columns: ["investigacao_id"]
            isOneToOne: false
            referencedRelation: "investigacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          created_at: string
          id: string
          investigated_id: string | null
          mime: string | null
          nome: string
          storage_path: string
          tamanho: number | null
          tipo: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          investigated_id?: string | null
          mime?: string | null
          nome: string
          storage_path: string
          tamanho?: number | null
          tipo: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          investigated_id?: string | null
          mime?: string | null
          nome?: string
          storage_path?: string
          tamanho?: number | null
          tipo?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploads_investigated_id_fkey"
            columns: ["investigated_id"]
            isOneToOne: false
            referencedRelation: "investigateds"
            referencedColumns: ["id"]
          },
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
      email_purpose: "verification" | "recovery" | "general"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      email_purpose: ["verification", "recovery", "general"],
    },
  },
} as const
