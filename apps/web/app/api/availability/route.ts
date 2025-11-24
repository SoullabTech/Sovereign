import { NextRequest, NextResponse } from 'next/server';
import { format, addDays, startOfDay, endOfDay, addMinutes, isBefore, isAfter } from 'date-fns';

export const dynamic = 'force-dynamic';

// This would typically come from your database or calendar service
interface AvailabilitySettings {
  workingHours: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  sessionDuration: number; // minutes
  bufferTime: number; // minutes between sessions
  timezone: string;
}

interface BookedSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  type: 'booked' | 'blocked' | 'unavailable';
}

// Mock availability settings - this would come from your facilitator settings
const DEFAULT_AVAILABILITY: AvailabilitySettings = {
  workingHours: {
    monday: { start: '09:00', end: '17:00', available: true },
    tuesday: { start: '09:00', end: '17:00', available: true },
    wednesday: { start: '09:00', end: '17:00', available: true },
    thursday: { start: '09:00', end: '17:00', available: true },
    friday: { start: '09:00', end: '17:00', available: true },
    saturday: { start: '10:00', end: '14:00', available: false }, // Weekend hours
    sunday: { start: '10:00', end: '14:00', available: false },
  },
  sessionDuration: 60,
  bufferTime: 15,
  timezone: 'America/Los_Angeles', // PST/PDT
};

// Get booked slots from database and Apple Calendar
const getBookedSlots = async (startDate: Date, endDate: Date): Promise<BookedSlot[]> => {
  const bookedSlots: BookedSlot[] = [];

  try {
    // 1. Get confirmed bookings from database (session_records table)
    // TODO: Query your session_records table for confirmed bookings

    // 2. Get events from Apple Calendar
    const appleCalendarResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/calendar/apple?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );

    if (appleCalendarResponse.ok) {
      const { events } = await appleCalendarResponse.json();

      // Convert Apple Calendar events to booked slots
      events.forEach((event: any) => {
        bookedSlots.push({
          id: event.id,
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime),
          type: 'blocked' // Apple Calendar events block availability
        });
      });
    }

    // 3. Add some mock database bookings for now
    bookedSlots.push(
      {
        id: 'booking-1',
        startTime: addMinutes(startOfDay(new Date()), 10 * 60), // 10 AM today
        endTime: addMinutes(startOfDay(new Date()), 11 * 60), // 11 AM today
        type: 'booked'
      }
    );

  } catch (error) {
    console.error('Error fetching booked slots:', error);
    // Return mock data on error so availability still works
    bookedSlots.push({
      id: 'error-fallback',
      startTime: addMinutes(startOfDay(new Date()), 10 * 60),
      endTime: addMinutes(startOfDay(new Date()), 11 * 60),
      type: 'blocked'
    });
  }

  return bookedSlots;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const daysParam = searchParams.get('days') || '7';
    const sessionTypeParam = searchParams.get('sessionType') || 'session';

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const startDate = new Date(dateParam);
    const days = parseInt(daysParam);
    const endDate = addDays(startDate, days);

    // Get availability settings for the practitioner
    const availability = DEFAULT_AVAILABILITY;

    // Get session duration based on type
    const sessionDurations: Record<string, number> = {
      consultation: 90,
      session: 60,
      intensive: 120,
    };
    const sessionDuration = sessionDurations[sessionTypeParam] || 60;

    // Get existing bookings
    const bookedSlots = await getBookedSlots(startDate, endDate);

    // Generate available time slots
    const availableSlots = [];

    for (let day = 0; day < days; day++) {
      const currentDate = addDays(startDate, day);
      const dayName = format(currentDate, 'EEEE').toLowerCase() as keyof typeof availability.workingHours;
      const daySettings = availability.workingHours[dayName];

      if (!daySettings.available) continue;

      // Parse working hours for this day
      const [startHour, startMinute] = daySettings.start.split(':').map(Number);
      const [endHour, endMinute] = daySettings.end.split(':').map(Number);

      const dayStart = new Date(currentDate);
      dayStart.setHours(startHour, startMinute, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setHours(endHour, endMinute, 0, 0);

      // Generate slots for this day
      let currentSlotStart = dayStart;

      while (addMinutes(currentSlotStart, sessionDuration) <= dayEnd) {
        const slotEnd = addMinutes(currentSlotStart, sessionDuration);

        // Check if this slot conflicts with existing bookings
        const hasConflict = bookedSlots.some(booking => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);

          // Check for overlap
          return (
            (currentSlotStart >= bookingStart && currentSlotStart < bookingEnd) ||
            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
            (currentSlotStart <= bookingStart && slotEnd >= bookingEnd)
          );
        });

        // Only include slots that are in the future
        const isInFuture = isAfter(currentSlotStart, new Date());

        availableSlots.push({
          id: `${format(currentSlotStart, 'yyyy-MM-dd-HH:mm')}`,
          startTime: currentSlotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          available: !hasConflict && isInFuture,
          sessionType: sessionTypeParam,
          duration: sessionDuration,
          dayOfWeek: dayName,
        });

        // Move to next slot (session duration + buffer time)
        currentSlotStart = addMinutes(currentSlotStart, sessionDuration + availability.bufferTime);
      }
    }

    return NextResponse.json({
      availability: availableSlots,
      settings: {
        sessionDuration,
        bufferTime: availability.bufferTime,
        timezone: availability.timezone,
      },
      bookedSlots: bookedSlots.map(slot => ({
        id: slot.id,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        type: slot.type,
      })),
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { workingHours, sessionDuration, bufferTime, timezone } = body;

    // TODO: Save availability settings to database
    // This would update your facilitator_settings table

    return NextResponse.json({
      success: true,
      message: 'Availability settings updated'
    });

  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}