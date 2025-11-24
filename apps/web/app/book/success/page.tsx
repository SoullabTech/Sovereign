"use client";

import { useEffect, useState } from 'react';
import { CheckCircle, Calendar, Clock, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';

interface BookingDetails {
  id: string;
  sessionType: string;
  date: string;
  time: string;
  duration: number;
  clientName: string;
  clientEmail: string;
  amount: number;
  paymentId: string;
}

export default function BookingSuccessPage() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get session ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      // Fetch booking details from your API
      fetchBookingDetails(sessionId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchBookingDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/bookings/confirm?session_id=${sessionId}`);
      const data = await response.json();
      setBookingDetails(data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCalendar = () => {
    if (!bookingDetails) return;

    const startDate = new Date(`${bookingDetails.date} ${bookingDetails.time}`);
    const endDate = new Date(startDate.getTime() + bookingDetails.duration * 60000);

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Spiralogic Session with Soullab&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=Your ${bookingDetails.sessionType} session is confirmed.&location=Online`;

    window.open(calendarUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-white/80">Confirming your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Booking Confirmed!</h1>
            <p className="text-xl text-white/80">
              Your session has been successfully booked and paid for.
            </p>
          </div>

          {/* Booking Details Card */}
          {bookingDetails ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Session Details</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  <div>
                    <div className="font-semibold text-white">Date</div>
                    <div className="text-white/70">{format(new Date(bookingDetails.date), 'EEEE, MMMM d, yyyy')}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="font-semibold text-white">Time</div>
                    <div className="text-white/70">{bookingDetails.time} ({bookingDetails.duration} minutes)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                  <Mail className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="font-semibold text-white">Session Type</div>
                    <div className="text-white/70 capitalize">{bookingDetails.sessionType.replace('-', ' ')}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">Payment Confirmed</span>
                  <span className="text-green-400 font-bold">${bookingDetails.amount / 100}</span>
                </div>
                <div className="text-sm text-white/60 mt-1">
                  Payment ID: {bookingDetails.paymentId}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8 text-center">
              <h2 className="text-xl font-bold text-white mb-4">Booking Confirmation</h2>
              <p className="text-white/70">
                Thank you for your booking! You should receive a confirmation email shortly with all the details.
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">What's Next?</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Check Your Email</div>
                  <div className="text-white/70 text-sm">
                    You'll receive a confirmation email with session details and a calendar invite.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Prepare for Your Session</div>
                  <div className="text-white/70 text-sm">
                    Take some time to reflect on what you'd like to explore. Come with an open heart and mind.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Join Your Session</div>
                  <div className="text-white/70 text-sm">
                    You'll receive connection details 24 hours before your session.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={addToCalendar}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3
                       bg-purple-500 text-white rounded-lg hover:bg-purple-600
                       transition-all duration-200 font-semibold"
            >
              <Calendar className="w-5 h-5" />
              Add to Calendar
            </button>

            <a
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3
                       bg-white/10 text-white rounded-lg hover:bg-white/20
                       transition-all duration-200 font-semibold border border-white/20"
            >
              Return Home
            </a>
          </div>

          {/* Contact Information */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-white mb-4">Questions?</h3>
            <p className="text-white/70 mb-4">
              If you need to reschedule or have any questions, please reach out:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@soullab.life</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Available via chat during business hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}