'use client';
import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CreditCard, Check } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, isAfter, isBefore, addMinutes, parse } from 'date-fns';
import { motion } from 'framer-motion';

interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  available: boolean;
  sessionType?: 'consultation' | 'session' | 'intensive';
}

interface SessionType {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number; // cents
  color: string;
  mystical: string;
  house: string;
}

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
  sessionType: string;
  timeSlot: TimeSlot | null;
  timezone: string;
}

interface ClientDetails {
  name: string;
  email: string;
  phone: string;
  notes: string;
  timezone: string;
}

const SESSION_TYPES: SessionType[] = [
  {
    id: 'consultation',
    name: 'Initial Discovery Session',
    description: 'A comprehensive first meeting where we explore your inner landscape, current challenges, and natural patterns. Together we\'ll create a personalized roadmap for your growth and healing journey.',
    duration: 90,
    price: 20000, // $200
    color: 'from-jade-shadow to-jade-forest',
    mystical: 'Where your story begins to unfold',
    house: 'Foundation Work'
  },
  {
    id: 'session',
    name: 'Personal Growth Session',
    description: 'Deep therapeutic work focusing on specific patterns, relationships, or life transitions. Using archetypal insights and somatic awareness to create lasting transformation.',
    duration: 60,
    price: 12500, // $125
    color: 'from-jade-forest to-jade-sage',
    mystical: 'Integration and breakthrough moments',
    house: 'Core Healing'
  },
  {
    id: 'intensive',
    name: 'Transformational Deep-Dive',
    description: 'An extended container for profound inner work. Perfect for processing major life transitions, trauma integration, or when you\'re ready for significant personal evolution.',
    duration: 120,
    price: 25000, // $250
    color: 'from-jade-sage to-jade-seafoam',
    mystical: 'Complete restructuring and renewal',
    house: 'Advanced Integration'
  }
];

// Fetch available time slots from API
const fetchAvailableSlots = async (date: Date, sessionType: string): Promise<TimeSlot[]> => {
  try {
    const response = await fetch(
      `/api/availability?date=${format(date, 'yyyy-MM-dd')}&sessionType=${sessionType}&days=1`
    );
    const data = await response.json();

    return data.availability.map((slot: any) => ({
      id: slot.id,
      startTime: new Date(slot.startTime),
      endTime: new Date(slot.endTime),
      available: slot.available,
      sessionType: slot.sessionType
    }));
  } catch (error) {
    console.error('Error fetching slots:', error);
    return [];
  }
};

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(null);
  const [bookingStep, setBookingStep] = useState<'session-type' | 'date-time' | 'details' | 'payment' | 'confirmation'>('session-type');
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    notes: '',
    sessionType: '',
    timeSlot: null,
    timezone: 'America/Los_Angeles'
  });

  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    name: '',
    email: '',
    phone: '',
    notes: '',
    timezone: 'America/Los_Angeles'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load available slots for selected date and session type
    if (selectedSessionType) {
      fetchAvailableSlots(selectedDate, selectedSessionType.id).then(setAvailableSlots);
    }
  }, [selectedDate, selectedSessionType]);

  const handleSessionTypeSelect = (sessionType: SessionType) => {
    setSelectedSessionType(sessionType);
    setBookingForm(prev => ({ ...prev, sessionType: sessionType.id }));
    setBookingStep('date-time');
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
    setBookingForm(prev => ({ ...prev, timeSlot: slot }));
    setBookingStep('details');
  };

  const handleFormUpdate = (field: string, value: string) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBookingSubmit = async () => {
    setIsLoading(true);
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: selectedSessionType?.id,
          timeSlot: selectedSlot,
          clientInfo: {
            name: clientDetails.name,
            email: clientDetails.email,
            phone: clientDetails.phone,
            notes: clientDetails.notes,
            timezone: clientDetails.timezone
          },
          amount: selectedSessionType?.price,
          successUrl: `${window.location.origin}/book/success`,
          cancelUrl: `${window.location.origin}/book`
        })
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Booking error:', error);
      alert('There was an error processing your booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCalendar = () => {
    const startDate = startOfWeek(selectedDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    return (
      <div className="bg-jade-shadow/60 backdrop-blur-md rounded-lg border border-jade-moss/30 p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-light text-jade-jade tracking-wide">Choose Your Date</h3>
          <div className="flex items-center gap-3 text-jade-mineral/70">
            <div className="w-8 h-0.5 bg-jade-sage/40"></div>
            <Calendar className="w-5 h-5" />
            <span className="text-sm tracking-wider">{format(selectedDate, 'MMMM yyyy')}</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-6">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="text-center text-xs font-light text-jade-moss/60 py-3 tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {days.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const isPast = isBefore(day, new Date()) && !isToday;

            return (
              <motion.button
                key={day.toISOString()}
                onClick={() => !isPast && setSelectedDate(day)}
                disabled={isPast}
                className={`
                  relative p-4 rounded-lg font-light transition-all duration-300
                  ${isSelected
                    ? 'bg-gradient-to-br from-jade-sage to-jade-seafoam text-white shadow-lg shadow-jade-sage/30'
                    : isPast
                      ? 'bg-jade-abyss/30 text-jade-moss/40 cursor-not-allowed border border-jade-shadow/20'
                      : 'bg-jade-night/50 text-jade-mineral hover:bg-jade-dusk/60 hover:text-jade-jade border border-jade-moss/30 hover:border-jade-sage/50'
                  }
                `}
                whileHover={!isPast ? { scale: 1.05 } : {}}
                whileTap={!isPast ? { scale: 0.95 } : {}}
              >
                {format(day, 'd')}
                {isToday && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-jade-seafoam rounded-full animate-pulse shadow-lg shadow-jade-seafoam/50"></div>
                )}
                {isSelected && (
                  <div className="absolute inset-0 rounded-lg bg-jade-sage/10 animate-pulse"></div>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <div className="text-xs text-jade-moss/60 italic tracking-wide">
            Select a date that feels aligned with your readiness
          </div>
        </div>
      </div>
    );
  };

  const renderTimeSlots = () => {
    return (
      <div className="bg-jade-shadow/60 backdrop-blur-md rounded-lg border border-jade-moss/30 p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-light text-jade-jade tracking-wide">Available Times</h3>
          <div className="flex items-center gap-3 text-jade-mineral/70">
            <div className="w-8 h-0.5 bg-jade-sage/40"></div>
            <Clock className="w-5 h-5" />
            <span className="text-sm tracking-wider">{format(selectedDate, 'EEEE, MMMM d')}</span>
          </div>
        </div>

        <div className="space-y-4">
          {availableSlots.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative mx-auto w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border border-jade-moss/30"></div>
                <div className="absolute inset-2 rounded-full border border-jade-forest/40"></div>
                <div className="absolute inset-4 rounded-full bg-jade-sage/20 animate-pulse"></div>
                <Clock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-jade-mineral/60" />
              </div>
              <p className="text-jade-mineral/70 mb-2">No appointments available this day</p>
              <p className="text-jade-moss/60 text-sm">Please select a different date</p>
            </div>
          ) : (
            availableSlots.map(slot => (
              <motion.button
                key={slot.id}
                onClick={() => handleTimeSlotSelect(slot)}
                disabled={!slot.available}
                className={`
                  w-full p-5 rounded-lg text-left transition-all duration-300 relative overflow-hidden group
                  ${slot.available
                    ? 'bg-jade-night/40 border border-jade-moss/30 hover:border-jade-sage/50 hover:bg-jade-dusk/50'
                    : 'bg-jade-abyss/20 border border-jade-shadow/20 cursor-not-allowed'
                  }
                  ${selectedSlot?.id === slot.id ? 'bg-jade-forest/20 border-jade-sage/50 shadow-lg shadow-jade-sage/10' : ''}
                `}
                whileHover={slot.available ? { scale: 1.02 } : {}}
                whileTap={slot.available ? { scale: 0.98 } : {}}
              >
                {/* Background glow effect */}
                {slot.available && (
                  <div className="absolute inset-0 bg-gradient-to-r from-jade-sage/5 via-jade-forest/5 to-jade-sage/5
                                opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-lg font-light tracking-wide ${
                      slot.available
                        ? selectedSlot?.id === slot.id
                          ? 'text-jade-jade'
                          : 'text-jade-mineral'
                        : 'text-jade-moss/50'
                    }`}>
                      {format(slot.startTime, 'h:mm a')} - {format(slot.endTime, 'h:mm a')}
                    </div>
                    {selectedSlot?.id === slot.id && (
                      <div className="w-3 h-3 bg-jade-seafoam rounded-full animate-pulse shadow-lg shadow-jade-seafoam/50"></div>
                    )}
                  </div>
                  <div className={`text-sm ${
                    slot.available
                      ? 'text-jade-mineral/70'
                      : 'text-jade-moss/40'
                  }`}>
                    {selectedSessionType?.mystical} • {selectedSessionType?.duration} minutes
                  </div>
                  {selectedSlot?.id === slot.id && (
                    <div className="mt-3 pt-3 border-t border-jade-sage/30">
                      <div className="text-xs text-jade-mineral/80 tracking-wide">
                        ✓ This time slot is selected
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover line effect */}
                {slot.available && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-jade-sage to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </motion.button>
            ))
          )}
        </div>

        {availableSlots.length > 0 && (
          <div className="mt-8 text-center">
            <div className="text-xs text-jade-moss/60 italic tracking-wide">
              Choose a time that feels right for your inner work
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-light text-center text-jade-jade mb-12">Book Your Session</h1>

        {bookingStep === 'session-type' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {SESSION_TYPES.map((sessionType) => (
                <motion.button
                  key={sessionType.id}
                  onClick={() => handleSessionTypeSelect(sessionType)}
                  className="p-6 rounded-xl border border-jade-moss/30 bg-jade-shadow/40 hover:bg-jade-shadow/60 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <h3 className="text-xl font-medium text-jade-jade mb-2">{sessionType.name}</h3>
                  <p className="text-jade-mineral/80 text-sm mb-4">{sessionType.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-jade-seafoam font-medium">${sessionType.price / 100}</span>
                    <span className="text-jade-mineral/60 text-sm">{sessionType.duration}min</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {bookingStep === 'date-time' && selectedSessionType && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-light text-jade-jade mb-2">{selectedSessionType.name}</h2>
              <p className="text-jade-mineral/80">{selectedSessionType.mystical}</p>
            </div>
            {renderCalendar()}
            {renderTimeSlots()}
          </div>
        )}
      </div>
    </div>
  );
}