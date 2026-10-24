
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "admins": {
                  Row: {
                    "created_at": string,"email": string,"id": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"id"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"id"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"booking_events": {
                  Row: {
                    "actor": string,"booking_id": string,"created_at": string,"from_status": Database["public"]['Enums']["booking_status"] | null,"id": string,"note": string | null,"to_status": Database["public"]['Enums']["booking_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "actor": string,"booking_id": string,"created_at"?: string,"from_status"?: Database["public"]['Enums']["booking_status"] | null,"id"?: string,"note"?: string | null,"to_status": Database["public"]['Enums']["booking_status"],"updated_at"?: string
                  }
                  Update: {
                    "actor"?: string,"booking_id"?: string,"created_at"?: string,"from_status"?: Database["public"]['Enums']["booking_status"] | null,"id"?: string,"note"?: string | null,"to_status"?: Database["public"]['Enums']["booking_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "booking_events_booking_id_fkey"
      columns: ["booking_id"]
isOneToOne: false
      referencedRelation: "bookings"
      referencedColumns: ["id"]
    }
                  ]
                },"bookings": {
                  Row: {
                    "admin_note": string | null,"check_in": string,"check_out": string,"code": string,"created_at": string,"decided_at": string | null,"decided_by": string | null,"guest_email": string,"guest_name": string,"guest_phone": string | null,"guests_count": number,"id": string,"locale": string,"message": string | null,"nationality": string | null,"price_snapshot": NonNullable<Json>,"privacy_consent_at": string | null,"reject_reason": string | null,"room_id": string,"status": Database["public"]['Enums']["booking_status"],"total_amount": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "admin_note"?: string | null,"check_in": string,"check_out": string,"code": string,"created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"guest_email": string,"guest_name": string,"guest_phone"?: string | null,"guests_count"?: number,"id"?: string,"locale"?: string,"message"?: string | null,"nationality"?: string | null,"price_snapshot": NonNullable<Json>,"privacy_consent_at"?: string | null,"reject_reason"?: string | null,"room_id": string,"status"?: Database["public"]['Enums']["booking_status"],"total_amount": number,"updated_at"?: string
                  }
                  Update: {
                    "admin_note"?: string | null,"check_in"?: string,"check_out"?: string,"code"?: string,"created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"guest_email"?: string,"guest_name"?: string,"guest_phone"?: string | null,"guests_count"?: number,"id"?: string,"locale"?: string,"message"?: string | null,"nationality"?: string | null,"price_snapshot"?: NonNullable<Json>,"privacy_consent_at"?: string | null,"reject_reason"?: string | null,"room_id"?: string,"status"?: Database["public"]['Enums']["booking_status"],"total_amount"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "bookings_room_id_fkey"
      columns: ["room_id"]
isOneToOne: false
      referencedRelation: "rooms"
      referencedColumns: ["id"]
    }
                  ]
                },"districts": {
                  Row: {
                    "created_at": string,"id": string,"name_en": string,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name_en": string,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name_en"?: string,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"email_logs": {
                  Row: {
                    "booking_id": string | null,"created_at": string,"error": string | null,"id": string,"status": Database["public"]['Enums']["email_status"],"type": Database["public"]['Enums']["email_type"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "booking_id"?: string | null,"created_at"?: string,"error"?: string | null,"id"?: string,"status": Database["public"]['Enums']["email_status"],"type": Database["public"]['Enums']["email_type"],"updated_at"?: string
                  }
                  Update: {
                    "booking_id"?: string | null,"created_at"?: string,"error"?: string | null,"id"?: string,"status"?: Database["public"]['Enums']["email_status"],"type"?: Database["public"]['Enums']["email_type"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "email_logs_booking_id_fkey"
      columns: ["booking_id"]
isOneToOne: false
      referencedRelation: "bookings"
      referencedColumns: ["id"]
    }
                  ]
                },"listings": {
                  Row: {
                    "address_en": string,"amenities": (string)[],"created_at": string,"description": string,"district_id": string,"id": string,"is_published": boolean,"lat": number,"lng": number,"nearest_station": string,"title": string,"type": Database["public"]['Enums']["listing_type"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address_en"?: string,"amenities"?: (string)[],"created_at"?: string,"description"?: string,"district_id": string,"id"?: string,"is_published"?: boolean,"lat": number,"lng": number,"nearest_station"?: string,"title": string,"type": Database["public"]['Enums']["listing_type"],"updated_at"?: string
                  }
                  Update: {
                    "address_en"?: string,"amenities"?: (string)[],"created_at"?: string,"description"?: string,"district_id"?: string,"id"?: string,"is_published"?: boolean,"lat"?: number,"lng"?: number,"nearest_station"?: string,"title"?: string,"type"?: Database["public"]['Enums']["listing_type"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "listings_district_id_fkey"
      columns: ["district_id"]
isOneToOne: false
      referencedRelation: "districts"
      referencedColumns: ["id"]
    }
                  ]
                },"photos": {
                  Row: {
                    "alt_text": string,"created_at": string,"id": string,"listing_id": string | null,"room_id": string | null,"sort_order": number,"storage_path": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "alt_text"?: string,"created_at"?: string,"id"?: string,"listing_id"?: string | null,"room_id"?: string | null,"sort_order"?: number,"storage_path": string,"updated_at"?: string
                  }
                  Update: {
                    "alt_text"?: string,"created_at"?: string,"id"?: string,"listing_id"?: string | null,"room_id"?: string | null,"sort_order"?: number,"storage_path"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "photos_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "photos_room_id_fkey"
      columns: ["room_id"]
isOneToOne: false
      referencedRelation: "rooms"
      referencedColumns: ["id"]
    }
                  ]
                },"rooms": {
                  Row: {
                    "created_at": string,"deposit": number,"features": (string)[],"id": string,"is_published": boolean,"listing_id": string,"maintenance_fee": number,"max_guests": number,"min_nights": number,"monthly_price": number,"name": string,"room_type": Database["public"]['Enums']["room_type"],"size_m2": number | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"deposit"?: number,"features"?: (string)[],"id"?: string,"is_published"?: boolean,"listing_id": string,"maintenance_fee"?: number,"max_guests"?: number,"min_nights"?: number,"monthly_price": number,"name": string,"room_type": Database["public"]['Enums']["room_type"],"size_m2"?: number | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"deposit"?: number,"features"?: (string)[],"id"?: string,"is_published"?: boolean,"listing_id"?: string,"maintenance_fee"?: number,"max_guests"?: number,"min_nights"?: number,"monthly_price"?: number,"name"?: string,"room_type"?: Database["public"]['Enums']["room_type"],"size_m2"?: number | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "rooms_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "get_booked_ranges":
{ Args: { "p_room_id"?: string }; Returns: {
              "check_in": string,"check_out": string,"room_id": string,"status": Database["public"]['Enums']["booking_status"]
            }[]
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           }
          }
          Enums: {
            "booking_status": "pending"|"approved"|"rejected"|"cancelled"|"expired"|"awaiting_payment"|"paid","email_status": "sent"|"failed","email_type": "received"|"approved"|"rejected"|"cancelled"|"admin_new_request","listing_type": "sharehouse"|"studio"|"apartment","room_type": "private"|"shared"|"entire"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "booking_status": ["pending", "approved", "rejected", "cancelled", "expired", "awaiting_payment", "paid"],"email_status": ["sent", "failed"],"email_type": ["received", "approved", "rejected", "cancelled", "admin_new_request"],"listing_type": ["sharehouse", "studio", "apartment"],"room_type": ["private", "shared", "entire"]
          }
        }
} as const
