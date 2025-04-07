import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Mail, Phone, Briefcase, UserCircle } from "lucide-react";
import supabase from "../../SupabaseClient";

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: authUser, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser?.user) {
        console.error("Error fetching user:", authError?.message);
        navigate("/login");
        return;
      }

      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
      } else {
        setUser(userProfile);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg mx-auto">
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                  <UserCircle className="w-16 h-16 text-gray-400" />
                </div>
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">{user.full_name}</h2>
            <p className="text-blue-100 text-sm">{user.role}</p>
          </div>

          {/* Profile Information */}
          <div className="px-6 py-6 space-y-6">
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center p-3 bg-gray-50 rounded-lg transition-all hover:bg-gray-100">
                <Mail className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center p-3 bg-gray-50 rounded-lg transition-all hover:bg-gray-100">
                <Phone className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{user.phone_number}</p>
                </div>
              </div>

              {/* Business */}
              <div className="flex items-center p-3 bg-gray-50 rounded-lg transition-all hover:bg-gray-100">
                <Briefcase className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Business</p>
                  <p className="text-sm font-medium text-gray-900">{user.business_name}</p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;