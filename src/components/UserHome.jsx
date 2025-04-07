import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Zap, History, User, Search, Battery, MapPin } from "lucide-react";
import L from "leaflet";
import supabase from "../../SupabaseClient";
import { useNavigate } from "react-router-dom";

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [30, 30],
});

const UserHome = () => {
  const [stations, setStations] = useState([]);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  // Fetch stations from Supabase
  useEffect(() => {
    const fetchStations = async () => {
      let { data, error } = await supabase.from("stations").select("*");
      if (error) {
        console.error("Error fetching stations:", error.message);
      } else {
        setStations(data);
      }
    };

    fetchStations();
  }, []);

  // Function to get user location & filter nearby stations
  const findNearbyStations = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      // Calculate distances and sort stations
      const stationsWithDistance = stations.map((station) => ({
        ...station,
        distance: getDistanceFromLatLonInKm(
          latitude,
          longitude,
          station.latitude,
          station.longitude
        ),
      }));

      const sortedStations = stationsWithDistance.sort((a, b) => a.distance - b.distance);

      // Filter for nearby stations (within 10km)
      const nearby = sortedStations.filter((station) => station.distance <= 10);

      setNearbyStations(nearby);
    });
  };

  // Haversine formula to calculate distance between two coordinates
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-2xl p-10 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Welcome to EV Charge Hub
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Discover and book charging stations near you with real-time availability
            and seamless booking experience.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-20">
          <Battery className="w-full h-full" />
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-green-100 rounded-full">
              <Battery className="h-8 w-8 text-green-600" />
            </div>
            <span className="ml-4 text-xl font-bold text-gray-800">Fast Charging</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Access to high-speed charging stations nationwide with guaranteed power output.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <span className="ml-4 text-xl font-bold text-gray-800">Easy Location</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Find stations with real-time availability and detailed navigation guidance.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
            <span className="ml-4 text-xl font-bold text-gray-800">Smart Booking</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Reserve your charging slot in advance with automated notifications and updates.
          </p>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Charging Station Map</h2>
        <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-inner">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {stations.map((station) => (
              <Marker
                key={station.id}
                position={[station.latitude, station.longitude]}
                icon={customIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-2">{station.name}</h3>
                    <p className="text-sm text-gray-600">Price: ₹{station.price_per_kwh}/kWh</p>
                    <p className="text-sm text-gray-600">Slots Available: {station.num_slots}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Stations List */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Available Stations</h2>
          <button
            onClick={findNearbyStations}
            className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300 flex items-center space-x-2"
          >
            <MapPin className="h-5 w-5" />
            <span>Find Nearby Stations</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stations
            .filter((station) => station.num_slots > 0)
            .map((station) => (
              <div key={station.id} className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold mb-3 text-gray-800">{station.name}</h3>
                <div className="space-y-2">
                  <p className="text-gray-600 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Price: ₹{station.price_per_kwh}/kWh
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <Battery className="h-4 w-4 mr-2" />
                    Slots Available: {station.num_slots}
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {station.charger_type}
                  </p>
                </div>
                <button
                  className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center space-x-2"
                  onClick={() => navigate(`/user/station-details/${station.id}`)}
                >
                  <Zap className="h-4 w-4" />
                  <span>Book Slot</span>
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Display Nearby Stations */}
      {nearbyStations.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Nearby Stations (Within 10km)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nearbyStations.map((station) => (
              <div key={station.id} className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold mb-3 text-gray-800">{station.name}</h3>
                <div className="space-y-2">
                  <p className="text-gray-600 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Price: ₹{station.price_per_kwh}/kWh
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <Battery className="h-4 w-4 mr-2" />
                    Slots Available: {station.num_slots}
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Distance: {station.distance.toFixed(2)} km
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {station.charger_type}
                  </p>
                </div>
                <button
                  className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center space-x-2"
                  onClick={() => navigate(`/user/station-details/${station.id}`)}
                >
                  <Zap className="h-4 w-4" />
                  <span>Book Slot</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHome;