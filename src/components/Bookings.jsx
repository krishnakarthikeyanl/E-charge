import React, { useState, useEffect } from "react";
import supabase from "../../SupabaseClient";
import { Calendar, Clock, Users, Zap } from "lucide-react";

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [ownerId, setOwnerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Step 1: Fetch Logged-in Owner ID
  useEffect(() => {
    const fetchOwnerId = async () => {
      setLoading(true);

      const { data: user, error: userError } = await supabase.auth.getUser();

      if (userError || !user?.user?.id) {
        console.error("Error fetching user:", userError);
        setError("Failed to get logged-in user.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setError("Profile not found.");
        setLoading(false);
        return;
      }

      setOwnerId(profile.id);
      setLoading(false);
    };

    fetchOwnerId();
  }, []);

  // Step 2: Fetch Bookings Only After Owner ID is Set
  useEffect(() => {
    if (!ownerId) return;

    const fetchOwnerBookings = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from("bookings")
          .select(
            "id, date, time, slots, created_at, user_id, " +
            "profiles(full_name, email), " +
            "stations(id, name, charger_type, price_per_kwh, owner_id)"
          )
          .neq("slots", 0) // Ensure only booked slots are shown
          .order("date", { ascending: true });

        if (supabaseError) {
          console.error("Supabase error:", supabaseError);
          setError(supabaseError);
        } else {
          // Step 3: Filter Bookings Where The Station Belongs to Owner
          const ownerBookings = data.filter(booking => booking.stations?.owner_id === ownerId);
          setBookings(ownerBookings);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching owner bookings:", err);
        setError("Error fetching data.");
      }
    };

    fetchOwnerBookings();

    // Step 4: Real-time Subscription to Bookings Table
    const subscription = supabase
      .channel("bookings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
          fetchOwnerBookings(); // Refetch only when a new booking is made
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [ownerId]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10">Error: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">User Booking Requests</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-500 text-center">No booking requests yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white shadow-lg rounded-lg p-5">
              <h2 className="text-xl font-semibold">{booking.stations?.name}</h2>
              <p className="text-gray-600">
                <Zap className="inline-block h-5 w-5 mr-2 text-yellow-500" />
                {booking.stations?.charger_type}
              </p>

              <p className="text-gray-600">
                <Users className="inline-block h-5 w-5 mr-2 text-blue-500" />
                Slots: {booking.slots}
              </p>

              <p className="text-gray-600">
                <Calendar className="inline-block h-5 w-5 mr-2 text-green-500" />
                {booking.date}
              </p>

              <p className="text-gray-600">
                <Clock className="inline-block h-5 w-5 mr-2 text-purple-500" />
                {booking.time}
              </p>

              <p className="text-gray-600">
                Price: ₹{booking.stations?.price_per_kwh} per kWh
              </p>

              <p className="text-gray-500 text-sm mt-2">
                Booked by: <strong>{booking.profiles?.full_name}</strong> ({booking.profiles?.email})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;
