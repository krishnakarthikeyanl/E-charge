import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../SupabaseClient";
import { Zap, Users } from "lucide-react";

const StationDetails = () => {
  const { stationId } = useParams();
  const navigate = useNavigate();

  const [station, setStation] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.error("User authentication failed:", error);
        navigate("/login");
      } else {
        setUserId(data.user.id);
      }
    };

    const fetchStation = async () => {
      const { data, error } = await supabase
        .from("stations")
        .select("*")
        .eq("id", stationId)
        .single();

      if (error) {
        console.error("Error fetching station:", error);
      } else {
        setStation(data);
      }
    };

    fetchUser();
    fetchStation();
  }, [stationId, navigate]);

  const handleBooking = async () => {
    if (!date || !time || slots < 1) {
      alert("Please select a valid date, time, and number of slots.");
      return;
    }
    if (slots > station.num_slots) {
      alert("Not enough available slots!");
      return;
    }

    setLoading(true);

    const { error: bookingError } = await supabase.from("bookings").insert([
      {
        station_id: station.id,
        user_id: userId,
        date,
        time,
        slots,
      },
    ]);

    if (bookingError) {
      console.error("Booking error:", bookingError);
      alert("Failed to book the slot.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("stations")
      .update({ num_slots: station.num_slots - slots })
      .eq("id", station.id);

    if (updateError) {
      console.error("Slot update error:", updateError);
      alert("Booking failed due to slot update error.");
    } else {
      alert("Booking successful!");
      navigate("/user/booking-history"); // Redirect to User Booking History
    }

    setLoading(false);
  };

  if (!station) return <p>Loading station details...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-4">{station.name}</h1>
      <p className="text-gray-600 mb-2">
        <Zap className="inline-block h-5 w-5 mr-2 text-yellow-500" />
        Charger Type: {station.charger_type}
      </p>
      <p className="text-gray-600 mb-2">
        <Users className="inline-block h-5 w-5 mr-2 text-blue-500" />
        Slots Available: {station.num_slots}
      </p>
      <p className="text-gray-600 mb-4">Price: ₹{station.price_per_kwh} per kWh</p>

      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block font-semibold">Choose Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border p-2 rounded-lg mb-4" />

        <label className="block font-semibold">Choose Time:</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full border p-2 rounded-lg mb-4" />

        <label className="block font-semibold">Number of Slots:</label>
        <input type="number" min="1" max={station.num_slots} value={slots} onChange={(e) => setSlots(Number(e.target.value))} className="w-full border p-2 rounded-lg mb-4" />

        <button onClick={handleBooking} disabled={loading} className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300">
          {loading ? "Booking..." : "Book Now"}
        </button>
      </div>
    </div>
  );
};

export default StationDetails;