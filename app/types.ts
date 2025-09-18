// ============================================================================
// CORE ENTITY TYPES
// ============================================================================

export type TherapistStatus = 'Rostered' | 'Available' | 'In Session' | 'Departed';
export type RoomType = 'Shower' | 'Large Shower' | 'VIP Jacuzzi';
export type RoomStatus = 'Available' | 'Occupied';
export type ServiceCategory = '1 Lady' | '2 Ladies' | 'Couple';
export type SessionStatus = 'Ready' | 'In Progress' | 'Completed';
export type BookingStatus = 'Scheduled' | 'Completed' | 'Cancelled';
export type WalkoutReason = 'No Rooms' | 'No Ladies' | 'Price Too High' | 'Client Too Picky' | 'Chinese' | 'Laowai';

// ============================================================================
// DATABASE ENTITY TYPES
// ============================================================================

export interface Therapist {
  id: string; // UUID from Supabase
  name: string;
  is_on_duty: boolean;
  status: TherapistStatus;
  check_in_time: string | null; // ISO timestamp
  check_out_time: string | null; // ISO timestamp
  active_room_id: string | null;
  completed_room_ids: string[];
  expenses: Array<{id: string; name: string; amount: number}>;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  status: RoomStatus;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  category: ServiceCategory;
  room_type: 'Shower' | 'VIP Jacuzzi'; // Note: Large Shower is compatible with Shower
  name: string;
  duration: number; // in minutes
  price: number;
  payout: number;
  created_at: string;
}

export interface Booking {
  id: string; // UUID
  therapist_ids: string[]; // Array of UUIDs
  service_id: number;
  start_time: string; // ISO timestamp
  end_time: string; // ISO timestamp
  status: BookingStatus;
  note: string | null;
  room_id: string | null; // Optional room assignment
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string; // UUID
  service_id: number;
  therapist_ids: string[]; // Array of UUIDs
  room_id: string;
  status: SessionStatus;
  start_time: string | null; // ISO timestamp
  end_time: string | null; // ISO timestamp
  duration: number; // in minutes
  price: number;
  payout: number;
  // Optional metadata
  discount?: number; // 0, 200, 300
  wob?: 'W' | 'O' | 'B'; // W=Walk-in, O=Online, B=Booking
  vip_number?: number; // VIP customer number (1-1000), null for non-VIP
  nationality?: 'Chinese' | 'Foreigner'; // Session nationality
  payment_method?: 'Cash' | 'Thai QR Code' | 'WeChat' | 'Alipay' | 'FX Cash (other than THB)'; // Payment method
  cash_amount?: number; // Amount paid in THB cash
  thai_qr_amount?: number; // Amount paid via Thai QR Code
  wechat_amount?: number; // Amount paid via WeChat
  alipay_amount?: number; // Amount paid via Alipay
  fx_cash_amount?: number; // Amount paid in foreign currency cash
  addon_items?: AddonItem[]; // Selected add-on items
  addon_custom_amount?: number; // Custom add-on amount (0-3000)
  notes?: string; // Session and customer notes
  created_at: string;
  updated_at: string;
}

export interface TherapistExpense {
  id: string; // UUID
  therapist_id: string; // UUID
  item_name: string;
  amount: number;
  created_at: string;
}

export interface ShopExpense {
  id: string; // UUID
  amount: number;
  note: string | null;
  created_at: string;
}

export interface Walkout {
  id: string; // UUID
  reason: WalkoutReason;
  count: number;
  created_at: string;
}

export interface DailyReport {
  id: string; // UUID
  report_date: string; // Date string
  total_revenue: number;
  shop_revenue: number;
  therapist_payouts: number;
  session_count: number;
  walkout_count: number;
  report_data: Record<string, unknown>; // JSONB data
  created_at: string;
}

// ============================================================================
// FRONTEND-SPECIFIC TYPES
// ============================================================================

// Therapist with computed properties for UI
export interface TherapistWithStats extends Therapist {
  total_expenses: number;
  gross_payout: number;
  net_payout: number;
  session_count: number;
  active_session?: SessionWithDetails;
  bookings: BookingWithDetails[];
}

// Session with related data for UI
export interface SessionWithDetails extends Session {
  service: Service;
  room: Room;
  therapists: Therapist[];
  time_remaining?: number; // in seconds, computed
  is_timer_running?: boolean;
}

// Booking with related data for UI
export interface BookingWithDetails extends Booking {
  service: Service;
  therapists: Therapist[];
}

// Room with session info for UI
export interface RoomWithSession extends Room {
  active_session?: SessionWithDetails;
}

// ============================================================================
// FINANCIAL TYPES
// ============================================================================

export interface FinancialSummary {
  total_revenue: number;
  shop_revenue: number;
  therapist_payouts: number;
  net_profit: number; // calculated: shop_revenue - shop_expenses
  // Payment method breakdowns
  cash_revenue: number; // THB cash only
  thai_qr_revenue: number; // Thai QR Code payments
  wechat_revenue: number; // WeChat payments
  alipay_revenue: number; // Alipay payments
  fx_cash_revenue: number; // Foreign currency cash
}

export interface TherapistFinancials {
  therapist_id: string;
  therapist_name: string;
  gross_payout: number;
  total_expenses: number;
  net_payout: number;
  session_count: number;
  check_in_time: string | null;
  check_out_time: string | null;
  total_hours: string; // formatted like "8.5 hrs" or "Active"
}

export interface WalkoutSummary {
  total_incidents: number;
  total_people: number;
  reason_breakdown: Record<WalkoutReason, number>;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface AddonItem {
  name: string;
  price: number;
}

export interface CreateSessionForm {
  category: ServiceCategory;
  service_id: number;
  therapist_ids: string[];
  room_id: string;
  booking_id?: string;
  discount?: number;
  wob?: 'W' | 'O' | 'B'; // W=Walk-in, O=Online, B=Booking
  vip_number?: number; // VIP customer number (1-1000)
  nationality?: 'Chinese' | 'Foreigner'; // Session nationality
  payment_method?: 'Cash' | 'Thai QR Code' | 'WeChat' | 'Alipay' | 'FX Cash (other than THB)'; // Payment method
  cash_amount?: number; // Amount paid in THB cash
  thai_qr_amount?: number; // Amount paid via Thai QR Code
  wechat_amount?: number; // Amount paid via WeChat
  alipay_amount?: number; // Amount paid via Alipay
  fx_cash_amount?: number; // Amount paid in foreign currency cash
  addon_items?: AddonItem[]; // Selected add-on items
  addon_custom_amount?: number; // Custom add-on amount (0-3000)
  notes?: string; // Session and customer notes
}

export interface CreateBookingForm {
  therapist_ids: string[];
  service_id: number;
  start_time: string; // ISO timestamp
  note?: string;
}

export interface UpdateBookingForm {
  serviceId: number;
  therapistIds: string[];
  startTime: string; // ISO timestamp string
  endTime: string; // ISO timestamp string
  roomId?: string;
  note?: string;
}

export interface AddExpenseForm {
  therapist_id: string;
  item_name: string;
  amount: number;
}

export interface AddShopExpenseForm {
  amount: number;
  note: string;
}

export interface LogWalkoutForm {
  reason: WalkoutReason;
  count: number;
}

export interface ModifySessionForm {
  session_id: string;
  service_id?: number;
  room_id?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

export interface AppState {
  therapists: TherapistWithStats[];
  rooms: RoomWithSession[];
  services: Service[];
  active_sessions: SessionWithDetails[];
  completed_sessions: SessionWithDetails[];
  bookings: BookingWithDetails[];
  walkouts: Walkout[];
  shop_expenses: ShopExpense[];
  financials: FinancialSummary;
  is_loading: boolean;
  error: string | null;
}

export interface SessionTimer {
  session_id: string;
  interval_id: NodeJS.Timeout;
  end_time: Date;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface RoomCompatibility {
  service_id: number;
  compatible_rooms: string[];
}

export interface ServiceFilter {
  category?: ServiceCategory;
  room_type?: RoomType;
  min_duration?: number;
  max_duration?: number;
  min_price?: number;
  max_price?: number;
}

export interface TherapistFilter {
  status?: TherapistStatus;
  is_on_duty?: boolean;
  has_active_session?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const EXPENSE_ITEMS = [
  { id: 'condom-12', name: 'Condom 12', price: 50 },
  { id: 'condom-24', name: 'Condom 24', price: 60 },
  { id: 'condom-36', name: 'Condom 36', price: 70 },
  { id: 'condom-48', name: 'Condom 48', price: 80 },
  { id: 'lube', name: 'Lube', price: 100 },
  { id: 'towel', name: 'Towel', price: 30 },
  { id: 'other', name: 'Other', price: 0 }
] as const;

export const WALEOUT_REASONS: Record<WalkoutReason, string> = {
  'No Rooms': 'bg-red-500',
  'No Ladies': 'bg-pink-500',
  'Price Too High': 'bg-yellow-500',
  'Client Too Picky': 'bg-orange-500',
  'Chinese': 'bg-blue-500',
  'Laowai': 'bg-purple-500'
} as const;

export const STATUS_COLORS: Record<TherapistStatus, string> = {
  'Rostered': 'bg-blue-500',
  'Available': 'bg-green-500',
  'In Session': 'bg-yellow-500',
  'Departed': 'bg-gray-500'
} as const;

export const ROOM_STATUS_COLORS: Record<RoomStatus, string> = {
  'Available': 'bg-green-500',
  'Occupied': 'bg-red-500'
} as const;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isTherapistStatus(status: string): status is TherapistStatus {
  return ['Rostered', 'Available', 'In Session', 'Departed'].includes(status);
}

export function isRoomType(type: string): type is RoomType {
  return ['Shower', 'Large Shower', 'VIP Jacuzzi'].includes(type);
}

export function isServiceCategory(category: string): category is ServiceCategory {
  return ['1 Lady', '2 Ladies', 'Couple'].includes(category);
}

export function isWalkoutReason(reason: string): reason is WalkoutReason {
  return ['No Rooms', 'No Ladies', 'Price Too High', 'Client Too Picky', 'Chinese', 'Laowai'].includes(reason);
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type TherapistId = string;
export type RoomId = string;
export type ServiceId = number;
export type SessionId = string;
export type BookingId = string;

// For form validation
export type FormErrors<T> = Partial<Record<keyof T, string>>;

// For API operations
export type CreateOperation<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type UpdateOperation<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>> & { id: string };

// For real-time subscriptions
export type RealtimeEvent<T> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  table: string;
};
