import type { 
  Therapist, 
  Room, 
  Service, 
  Session, 
  Booking, 
  TherapistExpense, 
  ShopExpense, 
  Walkout,
  TherapistStatus,
  RoomType,
  RoomStatus,
  ServiceCategory,
  SessionStatus,
  BookingStatus,
  WalkoutReason
} from "~/types";

// ============================================================================
// VALIDATION ERROR TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateTherapist(therapist: Partial<Therapist>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!therapist.name || therapist.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (therapist.name.length > 100) {
    errors.push({ field: 'name', message: 'Name must be less than 100 characters' });
  }

  if (therapist.status && !isValidTherapistStatus(therapist.status)) {
    errors.push({ field: 'status', message: 'Invalid therapist status' });
  }

  if (therapist.check_in_time && !isValidISOTimestamp(therapist.check_in_time)) {
    errors.push({ field: 'check_in_time', message: 'Invalid check-in time format' });
  }

  if (therapist.check_out_time && !isValidISOTimestamp(therapist.check_out_time)) {
    errors.push({ field: 'check_out_time', message: 'Invalid check-out time format' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateRoom(room: Partial<Room>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!room.name || room.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Room name is required' });
  } else if (room.name.length > 50) {
    errors.push({ field: 'name', message: 'Room name must be less than 50 characters' });
  }

  if (room.type && !isValidRoomType(room.type)) {
    errors.push({ field: 'type', message: 'Invalid room type' });
  }

  if (room.status && !isValidRoomStatus(room.status)) {
    errors.push({ field: 'status', message: 'Invalid room status' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateService(service: Partial<Service>): ValidationResult {
  const errors: ValidationError[] = [];

  if (service.category && !isValidServiceCategory(service.category)) {
    errors.push({ field: 'category', message: 'Invalid service category' });
  }

  if (service.room_type && !['Shower', 'VIP Jacuzzi'].includes(service.room_type)) {
    errors.push({ field: 'room_type', message: 'Invalid room type' });
  }

  if (!service.name || service.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Service name is required' });
  } else if (service.name.length > 100) {
    errors.push({ field: 'name', message: 'Service name must be less than 100 characters' });
  }

  if (service.duration !== undefined) {
    if (service.duration <= 0) {
      errors.push({ field: 'duration', message: 'Duration must be greater than 0' });
    } else if (service.duration > 480) { // 8 hours max
      errors.push({ field: 'duration', message: 'Duration must be less than 8 hours' });
    }
  }

  if (service.price !== undefined) {
    if (service.price < 0) {
      errors.push({ field: 'price', message: 'Price cannot be negative' });
    } else if (service.price > 100000) {
      errors.push({ field: 'price', message: 'Price must be less than 100,000' });
    }
  }

  if (service.payout !== undefined) {
    if (service.payout < 0) {
      errors.push({ field: 'payout', message: 'Payout cannot be negative' });
    } else if (service.payout > (service.price || 0)) {
      errors.push({ field: 'payout', message: 'Payout cannot exceed price' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateSession(session: Partial<Session>): ValidationResult {
  const errors: ValidationError[] = [];

  if (session.service_id !== undefined && session.service_id <= 0) {
    errors.push({ field: 'service_id', message: 'Invalid service ID' });
  }

  if (session.therapist_ids !== undefined) {
    if (!Array.isArray(session.therapist_ids) || session.therapist_ids.length === 0) {
      errors.push({ field: 'therapist_ids', message: 'At least one therapist is required' });
    } else if (session.therapist_ids.length > 2) {
      errors.push({ field: 'therapist_ids', message: 'Maximum 2 therapists per session' });
    }
  }

  if (session.room_id !== undefined && !session.room_id) {
    errors.push({ field: 'room_id', message: 'Room ID is required' });
  }

  if (session.status && !isValidSessionStatus(session.status)) {
    errors.push({ field: 'status', message: 'Invalid session status' });
  }

  if (session.start_time && !isValidISOTimestamp(session.start_time)) {
    errors.push({ field: 'start_time', message: 'Invalid start time format' });
  }

  if (session.end_time && !isValidISOTimestamp(session.end_time)) {
    errors.push({ field: 'end_time', message: 'Invalid end time format' });
  }

  if (session.duration !== undefined) {
    if (session.duration <= 0) {
      errors.push({ field: 'duration', message: 'Duration must be greater than 0' });
    } else if (session.duration > 480) {
      errors.push({ field: 'duration', message: 'Duration must be less than 8 hours' });
    }
  }

  if (session.price !== undefined && session.price < 0) {
    errors.push({ field: 'price', message: 'Price cannot be negative' });
  }

  if (session.payout !== undefined && session.payout < 0) {
    errors.push({ field: 'payout', message: 'Payout cannot be negative' });
  }

  // Optional fields
  if (session.discount !== undefined) {
    if (![0, 200, 300].includes(Number(session.discount))) {
      errors.push({ field: 'discount', message: 'Discount must be 0, 200, or 300' });
    }
  }

  if (session.wob !== undefined) {
    if (!['W', 'O', 'B'].includes(session.wob as string)) {
      errors.push({ field: 'wob', message: 'WOB must be W (Walk-in), O (Online), or B (Booking)' });
    }
  }

  if (session.vip !== undefined && typeof session.vip !== 'boolean') {
    errors.push({ field: 'vip', message: 'VIP must be a boolean' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateBooking(booking: Partial<Booking>): ValidationResult {
  const errors: ValidationError[] = [];

  if (booking.therapist_ids !== undefined) {
    if (!Array.isArray(booking.therapist_ids) || booking.therapist_ids.length === 0) {
      errors.push({ field: 'therapist_ids', message: 'At least one therapist is required' });
    } else if (booking.therapist_ids.length > 2) {
      errors.push({ field: 'therapist_ids', message: 'Maximum 2 therapists per booking' });
    }
  }

  if (booking.service_id !== undefined && booking.service_id <= 0) {
    errors.push({ field: 'service_id', message: 'Invalid service ID' });
  }

  if (booking.start_time && !isValidISOTimestamp(booking.start_time)) {
    errors.push({ field: 'start_time', message: 'Invalid start time format' });
  }

  if (booking.end_time && !isValidISOTimestamp(booking.end_time)) {
    errors.push({ field: 'end_time', message: 'Invalid end time format' });
  }

  if (booking.start_time && booking.end_time) {
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    if (start >= end) {
      errors.push({ field: 'end_time', message: 'End time must be after start time' });
    }
  }

  if (booking.status && !isValidBookingStatus(booking.status)) {
    errors.push({ field: 'status', message: 'Invalid booking status' });
  }

  if (booking.note && booking.note.length > 500) {
    errors.push({ field: 'note', message: 'Note must be less than 500 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateTherapistExpense(expense: Partial<TherapistExpense>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!expense.therapist_id) {
    errors.push({ field: 'therapist_id', message: 'Therapist ID is required' });
  }

  if (!expense.item_name || expense.item_name.trim().length === 0) {
    errors.push({ field: 'item_name', message: 'Item name is required' });
  } else if (expense.item_name.length > 100) {
    errors.push({ field: 'item_name', message: 'Item name must be less than 100 characters' });
  }

  if (expense.amount !== undefined) {
    if (expense.amount <= 0) {
      errors.push({ field: 'amount', message: 'Amount must be greater than 0' });
    } else if (expense.amount > 10000) {
      errors.push({ field: 'amount', message: 'Amount must be less than 10,000' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateShopExpense(expense: Partial<ShopExpense>): ValidationResult {
  const errors: ValidationError[] = [];

  if (expense.amount !== undefined) {
    if (expense.amount <= 0) {
      errors.push({ field: 'amount', message: 'Amount must be greater than 0' });
    } else if (expense.amount > 100000) {
      errors.push({ field: 'amount', message: 'Amount must be less than 100,000' });
    }
  }

  if (expense.note && expense.note.length > 500) {
    errors.push({ field: 'note', message: 'Note must be less than 500 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateWalkout(walkout: Partial<Walkout>): ValidationResult {
  const errors: ValidationError[] = [];

  if (walkout.reason && !isValidWalkoutReason(walkout.reason)) {
    errors.push({ field: 'reason', message: 'Invalid walkout reason' });
  }

  if (walkout.count !== undefined) {
    if (walkout.count <= 0) {
      errors.push({ field: 'count', message: 'Count must be greater than 0' });
    } else if (walkout.count > 100) {
      errors.push({ field: 'count', message: 'Count must be less than 100' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// TYPE GUARD FUNCTIONS
// ============================================================================

function isValidTherapistStatus(status: string): status is TherapistStatus {
  return ['Rostered', 'Available', 'In Session', 'Departed'].includes(status);
}

function isValidRoomType(type: string): type is RoomType {
  return ['Shower', 'Large Shower', 'VIP Jacuzzi'].includes(type);
}

function isValidRoomStatus(status: string): status is RoomStatus {
  return ['Available', 'Occupied'].includes(status);
}

function isValidServiceCategory(category: string): category is ServiceCategory {
  return ['1 Lady', '2 Ladies', 'Couple'].includes(category);
}

function isValidSessionStatus(status: string): status is SessionStatus {
  return ['Ready', 'In Progress', 'Completed'].includes(status);
}

function isValidBookingStatus(status: string): status is BookingStatus {
  return ['Scheduled', 'Completed', 'Cancelled'].includes(status);
}

function isValidWalkoutReason(reason: string): reason is WalkoutReason {
  return ['No Rooms', 'No Ladies', 'Price Too High', 'Client Too Picky', 'Chinese', 'Laowai'].includes(reason);
}

function isValidISOTimestamp(timestamp: string): boolean {
  const date = new Date(timestamp);
  return !isNaN(date.getTime()) && timestamp === date.toISOString();
}

// ============================================================================
// BUSINESS LOGIC VALIDATION
// ============================================================================

export function validateSessionStart(session: Session, therapists: Therapist[], rooms: Room[]): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if all therapists are available
  const selectedTherapists = therapists.filter(t => session.therapist_ids.includes(t.id));
  const unavailableTherapists = selectedTherapists.filter(t => t.status !== 'Available');
  
  if (unavailableTherapists.length > 0) {
    errors.push({ 
      field: 'therapist_ids', 
      message: `Therapists ${unavailableTherapists.map(t => t.name).join(', ')} are not available` 
    });
  }

  // Check if room is available
  const room = rooms.find(r => r.id === session.room_id);
  if (!room) {
    errors.push({ field: 'room_id', message: 'Room not found' });
  } else if (room.status !== 'Available') {
    errors.push({ field: 'room_id', message: `Room ${room.name} is not available` });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateTherapistCheckout(therapist: Therapist): ValidationResult {
  const errors: ValidationError[] = [];

  if (therapist.status === 'In Session') {
    errors.push({ 
      field: 'status', 
      message: 'Therapist cannot check out while in a session' 
    });
  }

  if (!therapist.check_in_time) {
    errors.push({ 
      field: 'check_in_time', 
      message: 'Therapist must check in before checking out' 
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
