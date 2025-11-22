// Database types based on Supabase schema

export type DayOfWeek = 
  | 'MONDAY' 
  | 'TUESDAY' 
  | 'WEDNESDAY' 
  | 'THURSDAY' 
  | 'FRIDAY' 
  | 'SATURDAY' 
  | 'SUNDAY';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export type NotificationType = 
  | 'CONFIRMATION' 
  | 'REMINDER' 
  | 'CANCELLATION' 
  | 'RESCHEDULE';

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface User {
  id: string;
  email: string;
  full_name: string;
  timezone: string;
  booking_slug: string;
  created_at: string;
  updated_at: string;
}

export interface EventType {
  id: string;
  user_id: string;
  name: string;
  duration_minutes: number;
  description: string | null;
  location: string | null;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  user_id: string;
  day_of_week: DayOfWeek;
  start_time: string; // TIME format (HH:MM:SS)
  end_time: string; // TIME format (HH:MM:SS)
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  event_type_id: string;
  host_user_id: string;
  guest_name: string;
  guest_email: string;
  guest_timezone: string;
  start_time_utc: string; // ISO 8601 datetime
  end_time_utc: string; // ISO 8601 datetime
  status: BookingStatus;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
}

export interface Notification {
  id: string;
  booking_id: string;
  notification_type: NotificationType;
  recipient_email: string;
  status: NotificationStatus;
  scheduled_for: string;
  sent_at: string | null;
  created_at: string;
}

// Extended types with relations
export interface BookingWithDetails extends Booking {
  event_type: EventType;
  host: User;
}

export interface EventTypeWithUser extends EventType {
  user: User;
}

// Form types
export interface SignUpForm {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface EventTypeForm {
  name: string;
  duration_minutes: number;
  description?: string;
  location?: string;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  is_active: boolean;
}

export interface AvailabilityForm {
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface BookingForm {
  guest_name: string;
  guest_email: string;
  guest_timezone: string;
  start_time_utc: string;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    status: number;
    message: string;
    details?: string[];
  };
}

// Time slot type for availability calculation
export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

// Helper type for grouped availabilities
export type AvailabilityByDay = Record<DayOfWeek, Availability[]>;
