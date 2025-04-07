import React, { useState, useEffect } from "react";
import supabase from "../../SupabaseClient";
import { Calendar, Clock, Users, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      try {
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError || !user?.user) {
          throw new Error("User authentication failed");
        }

        setUserId(user.user.id);

        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select("*, stations(name, charger_type, price_per_kwh)")
          .eq("user_id", user.user.id)
          .order('date', { ascending: sortOrder === 'asc' });

        if (bookingError) {
          throw new Error("Error fetching bookings");
        }

        // Add status based on date and time
        const now = new Date();
        const processedBookings = bookingData.map(booking => {
          const bookingDateTime = new Date(`${booking.date} ${booking.time}`);
          let status;
          if (bookingDateTime > now) {
            status = 'upcoming';
          } else if (bookingDateTime.toDateString() === now.toDateString()) {
            status = 'today';
          } else {
            status = 'completed';
          }
          return { ...booking, status };
        });

        setBookings(processedBookings);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBookings();
  }, [sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'today':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4" />;
      case 'today':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-gray-100 p-6 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No bookings found</h3>
          <p className="mt-2 text-gray-500">You haven't made any bookings yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <button
          onClick={toggleSortOrder}
          className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          Sort by Date
          {sortOrder === 'desc' ? (
            <ChevronDown className="h-4 w-4 ml-2" />
          ) : (
            <ChevronUp className="h-4 w-4 ml-2" />
          )}
        </button>
      </div>
      <div className="grid gap-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white shadow-lg p-6 rounded-lg hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">{booking.stations.name}</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(
                  booking.status
                )}`}
              >
                {getStatusIcon(booking.status)}
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-gray-600 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                  {new Date(booking.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-600 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-400" />
                  {booking.time}
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-600 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-gray-400" />
                  {booking.slots} {booking.slots === 1 ? 'Slot' : 'Slots'}
                </p>
                <p className="text-gray-600 flex items-center font-medium">
                  ₹{booking.stations.price_per_kwh}/kWh
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Charger Type: {booking.stations.charger_type}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingHistory;