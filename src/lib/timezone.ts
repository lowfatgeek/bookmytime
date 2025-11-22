import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import { addMinutes, isAfter, isBefore, parseISO } from 'date-fns'

/**
 * Get the user's browser timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Format a date in a specific timezone
 */
export function formatDateInTimezone(
  date: Date | string,
  timezone: string,
  formatString: string = 'PPpp'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(dateObj, timezone, formatString)
}

/**
 * Convert a time string (HH:mm) to a Date object for a specific date and timezone
 */
export function timeStringToDate(
  timeString: string,
  date: Date,
  timezone: string
): Date {
  const [hours, minutes] = timeString.split(':').map(Number)
  const zonedDate = toZonedTime(date, timezone)
  zonedDate.setHours(hours, minutes, 0, 0)
  return zonedDate
}

/**
 * Convert a Date object to time string (HH:mm) in a specific timezone
 */
export function dateToTimeString(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'HH:mm')
}

/**
 * Get all available IANA timezones (popular ones)
 */
export function getPopularTimezones(): { value: string; label: string }[] {
  return [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Phoenix', label: 'Arizona' },
    { value: 'America/Anchorage', label: 'Alaska' },
    { value: 'Pacific/Honolulu', label: 'Hawaii' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Asia/Singapore', label: 'Singapore' },
    { value: 'Asia/Dubai', label: 'Dubai' },
    { value: 'Australia/Sydney', label: 'Sydney' },
    { value: 'UTC', label: 'UTC' },
  ]
}

/**
 * Generate time slots for a given date range
 */
export function generateTimeSlots(
  startDate: Date,
  endDate: Date,
  durationMinutes: number,
  timezone: string
): Date[] {
  const slots: Date[] = []
  let currentSlot = startDate

  while (isBefore(currentSlot, endDate)) {
    slots.push(new Date(currentSlot))
    currentSlot = addMinutes(currentSlot, durationMinutes)
  }

  return slots
}

/**
 * Check if a time slot overlaps with existing bookings
 */
export function hasOverlap(
  slotStart: Date,
  slotEnd: Date,
  existingStart: Date,
  existingEnd: Date
): boolean {
  return (
    (isAfter(slotStart, existingStart) && isBefore(slotStart, existingEnd)) ||
    (isAfter(slotEnd, existingStart) && isBefore(slotEnd, existingEnd)) ||
    (isBefore(slotStart, existingStart) && isAfter(slotEnd, existingEnd)) ||
    (slotStart.getTime() === existingStart.getTime())
  )
}

/**
 * Convert UTC datetime to user's timezone
 */
export function utcToTimezone(utcDate: Date | string, timezone: string): Date {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate
  return toZonedTime(date, timezone)
}

/**
 * Format a date range with timezone
 */
export function formatDateRange(
  startDate: Date | string,
  endDate: Date | string,
  timezone: string
): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate

  const formattedStart = formatInTimeZone(start, timezone, 'PPp')
  const formattedEnd = formatInTimeZone(end, timezone, 'p')

  return `${formattedStart} - ${formattedEnd}`
}

/**
 * Get timezone offset display (e.g., "GMT-5")
 */
export function getTimezoneOffset(timezone: string, date: Date = new Date()): string {
  const formatted = formatInTimeZone(date, timezone, 'XXX')
  return `GMT${formatted}`
}

/**
 * Parse time string to minutes from midnight
 */
export function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Convert minutes from midnight to time string
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}
