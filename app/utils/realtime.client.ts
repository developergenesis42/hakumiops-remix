import { getSupabaseClient } from "~/utils/getSupabaseClient";
import type { 
  Therapist, 
  Room, 
  Session, 
  Booking, 
  TherapistExpense, 
  ShopExpense, 
  Walkout 
} from "~/types";

// ============================================================================
// CLIENT-SIDE REALTIME SUBSCRIPTION TYPES
// ============================================================================

export type RealtimeCallback<T> = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
  table: string;
}) => void;

export type SubscriptionHandle = {
  unsubscribe: () => void;
};

// ============================================================================
// CLIENT-SIDE REALTIME SUBSCRIPTION FUNCTIONS
// ============================================================================

export function subscribeToTherapists(callback: RealtimeCallback<Therapist>): SubscriptionHandle {
  const supabase = getSupabaseClient();
  
  const subscription = supabase
    .channel('therapists-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'therapists' 
      }, 
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Therapist | null,
          old: payload.old as Therapist | null,
          table: 'therapists'
        });
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(subscription);
    }
  };
}

export function subscribeToRooms(callback: RealtimeCallback<Room>): SubscriptionHandle {
  const supabase = getSupabaseClient();
  
  const subscription = supabase
    .channel('rooms-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'rooms' 
      }, 
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Room | null,
          old: payload.old as Room | null,
          table: 'rooms'
        });
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(subscription);
    }
  };
}

export function subscribeToSessions(callback: RealtimeCallback<Session>): SubscriptionHandle {
  const supabase = getSupabaseClient();
  
  const subscription = supabase
    .channel('sessions-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'sessions' 
      }, 
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Session | null,
          old: payload.old as Session | null,
          table: 'sessions'
        });
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(subscription);
    }
  };
}

export function subscribeToBookings(callback: RealtimeCallback<Booking>): SubscriptionHandle {
  const supabase = getSupabaseClient();
  
  const subscription = supabase
    .channel('bookings-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'bookings' 
      }, 
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Booking | null,
          old: payload.old as Booking | null,
          table: 'bookings'
        });
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(subscription);
    }
  };
}

export function subscribeToTherapistExpenses(callback: RealtimeCallback<TherapistExpense>): SubscriptionHandle {
  const supabase = getSupabaseClient();
  
  const subscription = supabase
    .channel('therapist-expenses-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'therapist_expenses' 
      }, 
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as TherapistExpense | null,
          old: payload.old as TherapistExpense | null,
          table: 'therapist_expenses'
        });
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(subscription);
    }
  };
}

export function subscribeToShopExpenses(callback: RealtimeCallback<ShopExpense>): SubscriptionHandle {
  const supabase = getSupabaseClient();
  
  const subscription = supabase
    .channel('shop-expenses-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'shop_expenses' 
      }, 
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as ShopExpense | null,
          old: payload.old as ShopExpense | null,
          table: 'shop_expenses'
        });
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(subscription);
    }
  };
}

export function subscribeToWalkouts(callback: RealtimeCallback<Walkout>): SubscriptionHandle {
  const supabase = getSupabaseClient();
  
  const subscription = supabase
    .channel('walkouts-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'walkouts' 
      }, 
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Walkout | null,
          old: payload.old as Walkout | null,
          table: 'walkouts'
        });
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(subscription);
    }
  };
}

// ============================================================================
// COMPOSITE SUBSCRIPTION FUNCTIONS
// ============================================================================

export function subscribeToAllData(callbacks: {
  onTherapistChange?: RealtimeCallback<Therapist>;
  onRoomChange?: RealtimeCallback<Room>;
  onSessionChange?: RealtimeCallback<Session>;
  onBookingChange?: RealtimeCallback<Booking>;
  onTherapistExpenseChange?: RealtimeCallback<TherapistExpense>;
  onShopExpenseChange?: RealtimeCallback<ShopExpense>;
  onWalkoutChange?: RealtimeCallback<Walkout>;
}): {
  unsubscribe: () => void;
} {
  const subscriptions: SubscriptionHandle[] = [];

  if (callbacks.onTherapistChange) {
    subscriptions.push(subscribeToTherapists(callbacks.onTherapistChange));
  }
  if (callbacks.onRoomChange) {
    subscriptions.push(subscribeToRooms(callbacks.onRoomChange));
  }
  if (callbacks.onSessionChange) {
    subscriptions.push(subscribeToSessions(callbacks.onSessionChange));
  }
  if (callbacks.onBookingChange) {
    subscriptions.push(subscribeToBookings(callbacks.onBookingChange));
  }
  if (callbacks.onTherapistExpenseChange) {
    subscriptions.push(subscribeToTherapistExpenses(callbacks.onTherapistExpenseChange));
  }
  if (callbacks.onShopExpenseChange) {
    subscriptions.push(subscribeToShopExpenses(callbacks.onShopExpenseChange));
  }
  if (callbacks.onWalkoutChange) {
    subscriptions.push(subscribeToWalkouts(callbacks.onWalkoutChange));
  }

  return {
    unsubscribe: () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    }
  };
}
