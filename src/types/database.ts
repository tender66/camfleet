export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "manager" | "staff";
export type EquipmentStatus = "available" | "on_loan" | "maintenance" | "retired";
export type LoanStatus = "pending" | "approved" | "active" | "returned" | "overdue" | "cancelled";
export type LocationType = "storage" | "shooting" | "both";
export type InvitationStatus = "pending" | "accepted" | "expired";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      equipment_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: LocationType;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type?: LocationType;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          type?: LocationType;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      productions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          location_id: string | null;
          start_date: string | null;
          end_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          location_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          location_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      equipment: {
        Row: {
          id: string;
          asset_number: string;
          name: string;
          brand: string | null;
          model: string | null;
          serial_number: string | null;
          category_id: string | null;
          parent_id: string | null;
          current_location_id: string | null;
          status: EquipmentStatus;
          notes: string | null;
          image_url: string | null;
          purchase_date: string | null;
          purchase_price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asset_number: string;
          name: string;
          brand?: string | null;
          model?: string | null;
          serial_number?: string | null;
          category_id?: string | null;
          parent_id?: string | null;
          current_location_id?: string | null;
          status?: EquipmentStatus;
          notes?: string | null;
          image_url?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          asset_number?: string;
          name?: string;
          brand?: string | null;
          model?: string | null;
          serial_number?: string | null;
          category_id?: string | null;
          parent_id?: string | null;
          current_location_id?: string | null;
          status?: EquipmentStatus;
          notes?: string | null;
          image_url?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          updated_at?: string;
        };
      };
      loans: {
        Row: {
          id: string;
          equipment_id: string;
          borrower_id: string;
          approved_by: string | null;
          from_location_id: string | null;
          to_location_id: string | null;
          production_id: string | null;
          expected_return_date: string | null;
          actual_return_date: string | null;
          status: LoanStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          equipment_id: string;
          borrower_id: string;
          approved_by?: string | null;
          from_location_id?: string | null;
          to_location_id?: string | null;
          production_id?: string | null;
          expected_return_date?: string | null;
          actual_return_date?: string | null;
          status?: LoanStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          approved_by?: string | null;
          from_location_id?: string | null;
          to_location_id?: string | null;
          production_id?: string | null;
          expected_return_date?: string | null;
          actual_return_date?: string | null;
          status?: LoanStatus;
          notes?: string | null;
          updated_at?: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          invited_by: string | null;
          token: string;
          status: InvitationStatus;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: UserRole;
          invited_by?: string | null;
          token?: string;
          status?: InvitationStatus;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          status?: InvitationStatus;
        };
      };
    };
  };
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Equipment = Database["public"]["Tables"]["equipment"]["Row"];
export type EquipmentCategory = Database["public"]["Tables"]["equipment_categories"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type Production = Database["public"]["Tables"]["productions"]["Row"];
export type Loan = Database["public"]["Tables"]["loans"]["Row"];
export type Invitation = Database["public"]["Tables"]["invitations"]["Row"];
