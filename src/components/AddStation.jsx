import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, BatteryCharging, Zap, Tag, Image as ImageIcon } from 'lucide-react';
import supabase from '../../SupabaseClient';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const ALLOWED_CHARGER_TYPES = ['Fast', 'Slow', 'Medium'];

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      console.log('📍 Clicked Coordinates:', e.latlng);
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

function AddStation() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [station, setStation] = useState({
    name: '',
    num_slots: '',
    price_per_kwh: '',
    charger_type: '',
    image_url: '',
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (location) => {
        setPosition({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      },
      () => {
        setPosition({ lat: 20.5937, lng: 78.9629 }); // Default: India
      }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!position) {
      alert('Please select a location on the map.');
      return;
    }

    const trimmedChargerType = station.charger_type.trim();
    if (!ALLOWED_CHARGER_TYPES.includes(trimmedChargerType)) {
      alert('Invalid charger type selected. Allowed types: Fast, Slow, Medium.');
      return;
    }

    console.log('Submitting Charger Type:', trimmedChargerType);

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('stations').insert([
        {
          owner_id: user.id,
          name: station.name,
          latitude: position.lat,
          longitude: position.lng,
          num_slots: parseInt(station.num_slots, 10),
          price_per_kwh: parseFloat(station.price_per_kwh),
          charger_type: trimmedChargerType,
          image_url: station.image_url || null,
          created_at: new Date().toISOString(),
        }
      ]);

      if (error) throw error;
      alert('Station added successfully!');
      setStation({ name: '', num_slots: '', price_per_kwh: '', charger_type: '', image_url: '' });
    } catch (error) {
      console.error('Supabase Insert Error:', error);
      console.log('Error Code:', error.code);
      console.log('Error Message:', error.message);
      console.log('Error Details:', error.details);
      alert('Failed to add station. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Add New Charging Station</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-2">
            <MapPin className="w-5 h-5 mr-2" /> Select Location
          </h2>
          <div className="h-[400px] border border-gray-200 rounded-lg overflow-hidden">
            {position && (
              <MapContainer center={[position.lat, position.lng]} zoom={13} className="h-full w-full">
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <input type="text" name="name" value={station.name} onChange={(e) => setStation({ ...station, name: e.target.value })} required placeholder="Station Name" className="w-full px-3 py-2 border rounded-md" />
            <input type="number" name="num_slots" value={station.num_slots} onChange={(e) => setStation({ ...station, num_slots: e.target.value })} required min="1" placeholder="Number of Slots" className="w-full px-3 py-2 border rounded-md" />
            <input type="number" name="price_per_kwh" value={station.price_per_kwh} onChange={(e) => setStation({ ...station, price_per_kwh: e.target.value })} required step="0.01" min="0" placeholder="Price per kWh" className="w-full px-3 py-2 border rounded-md" />
            <select name="charger_type" value={station.charger_type} onChange={(e) => setStation({ ...station, charger_type: e.target.value })} required className="w-full px-3 py-2 border rounded-md">
              <option value="">Select a charger type</option>
              {ALLOWED_CHARGER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <input type="url" name="image_url" value={station.image_url} onChange={(e) => setStation({ ...station, image_url: e.target.value })} placeholder="Image URL (Optional)" className="w-full px-3 py-2 border rounded-md" />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md">
              {loading ? 'Adding Station...' : 'Add Charging Station'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddStation;
