import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../SupabaseClient';
import { PlusCircle, MapPin, BatteryCharging, Wallet, Pencil, Trash2, Check, X, Zap } from 'lucide-react';

function OwnerHome() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStationId, setEditStationId] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchStations();
  }, []);

  async function fetchStations() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login', { replace: true });
        return;
      }

      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .eq('owner_id', session.user.id);

      if (error) throw error;
      setStations(data || []);
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit(stationId) {
    try {
      const { error } = await supabase
        .from('stations')
        .update({
          name: editData.name,
          charger_type: editData.charger_type,
          num_slots: editData.num_slots,
          price_per_kwh: editData.price_per_kwh,
        })
        .eq('id', stationId);
      
      if (error) throw error;
      
      setStations(stations.map(station => station.id === stationId ? { ...station, ...editData } : station));
      setEditStationId(null);
    } catch (error) {
      console.error('Error updating station:', error);
      alert('Failed to update station. Please try again.');
    }
  }

  async function handleDelete(stationId) {
    try {
      const { error } = await supabase.from('stations').delete().eq('id', stationId);
      if (error) throw error;
      setStations(stations.filter(station => station.id !== stationId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting station:', error);
      alert('Failed to delete station. Please try again.');
    }
  }

  function handleEdit(station) {
    setEditStationId(station.id);
    setEditData({
      name: station.name,
      charger_type: station.charger_type,
      num_slots: station.num_slots,
      price_per_kwh: station.price_per_kwh,
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Zap size={40} className="text-blue-500 animate-pulse" />
          <div className="text-blue-600 font-medium">Loading stations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Charging Stations</h1>
            <p className="text-gray-600">Manage your charging station network</p>
          </div>
          <button
            onClick={() => navigate('/owner/add-station')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 hover:shadow-lg"
          >
            <PlusCircle size={20} />
            Add Station
          </button>
        </div>

        {stations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center backdrop-blur-sm bg-opacity-90">
            <div className="max-w-md mx-auto">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <BatteryCharging size={40} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Stations Added Yet</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Get started by adding your first charging station to your network. Click the "Add Station" button above to begin.
              </p>
              <button
                onClick={() => navigate('/owner/add-station')}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
              >
                <PlusCircle size={20} />
                Add Your First Station
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stations.map((station) => (
              <div key={station.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 relative group backdrop-blur-sm bg-opacity-90">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                  {editStationId === station.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(station.id)}
                        className="p-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all transform hover:scale-110"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => setEditStationId(null)}
                        className="p-3 bg-gray-500 text-white rounded-full shadow-lg hover:bg-gray-600 transition-all transform hover:scale-110"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(station)}
                        className="p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all transform hover:scale-110"
                        title="Edit Station"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(station.id)}
                        className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all transform hover:scale-110"
                        title="Delete Station"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>

                {deleteConfirm === station.id && (
                  <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm mx-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Station?</h3>
                      <p className="text-gray-600 mb-6">
                        Are you sure you want to delete "{station.name}"? This action cannot be undone.
                      </p>
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(station.id)}
                          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-56 overflow-hidden">
                  <img
                    src={station.image_url || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80'}
                    alt={station.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-8">
                  {editStationId === station.id ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{station.name}</h3>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <MapPin size={20} className="text-blue-600" />
                      </div>
                      <span>{station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <BatteryCharging size={20} className="text-green-600" />
                      </div>
                      {editStationId === station.id ? (
                        <div className="flex-1">
                          <input
                            type="text"
                            value={editData.charger_type}
                            onChange={(e) => setEditData({ ...editData, charger_type: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="number"
                            value={editData.num_slots}
                            onChange={(e) => setEditData({ ...editData, num_slots: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      ) : (
                        <span>{station.charger_type} · {station.num_slots} slots</span>
                      )}
                    </div>

                    <div className="flex items-center text-gray-600">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <Wallet size={20} className="text-purple-600" />
                      </div>
                      {editStationId === station.id ? (
                        <input
                          type="number"
                          value={editData.price_per_kwh}
                          onChange={(e) => setEditData({ ...editData, price_per_kwh: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          step="0.01"
                        />
                      ) : (
                        <span>${station.price_per_kwh.toFixed(2)} per kWh</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerHome;