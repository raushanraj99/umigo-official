import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaWalking, FaShoppingBag } from "react-icons/fa";
import { FaClapperboard } from "react-icons/fa6";
import hangoutService from "../services/hangoutService";
import { userAPI } from "../services/authService";

const UserProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);

      try {
        let userData = null;

        // First Fetch hangout details
        try {
          userData = await hangoutService.getHangoutDetails(id);
        } catch (hangoutError) {
          console.warn("Hangout API failed, attempting fallback to user API", hangoutError);

          // Fallback: Fetch user details from Glow API
          const allUsers = await userAPI.getGlowUsers();
          userData = allUsers.find(user => user.user_id === id);
        }

        if (!userData) {
          console.error(`No hangout or user found for ID: ${id}`);
        }

        setCurrentUser(userData);
        // console.log(userData);
      } catch (error) {
        console.error("Unexpected error fetching user profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [id]);



  const nameFirstLetter = currentUser?.host?.name?.charAt(0)?.toUpperCase() || currentUser?.name?.charAt(0)?.toUpperCase() || '?';

  const getIcon = (title) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('coffee') || t.includes('cafe')) return <div className="text-2xl">☕</div>;
    if (t.includes('movie') || t.includes('cinema') || t.includes('film')) return <FaClapperboard className="text-2xl" />;
    if (t.includes('walk') || t.includes('stroll')) return <FaWalking className="text-2xl" />;
    if (t.includes('shop') || t.includes('mall') || t.includes('store')) return <FaShoppingBag className="text-2xl" />;
    return <div className="text-2xl">📅</div>;
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <div className="text-center mt-20">User not found.</div>;
  }


  return (
    <div className="min-h-screen bg-white pb-6">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-200 rounded-full px-3 py-1 flex items-center gap-1">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div className="flex items-center font-semibold text-black">
                {currentUser?.location || 'Unknown location'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col md:flex-row gap-7 lg:gap-20 xl:gap-32 p-8 lg:px-20 xl:px-30">
        <div className="flex flex-col justify-center items-center">
          <div className="rounded-full border overflow-hidden">
            {currentUser?.host?.avatarUrl || currentUser?.image_url ? (
              <img
                src={currentUser?.host?.avatarUrl || currentUser?.image_url}
                alt={currentUser?.host?.name || currentUser?.name || "User"}
                className="w-[150px] h-[150px] md:h-[300px] md:w-[300px] rounded-full object-cover"
              />
            ) : (
              <div className="w-[150px] h-[150px] md:h-[300px] md:w-[300px] flex items-center justify-center bg-gray-200 text-6xl font-bold rounded-full">
                {nameFirstLetter}
              </div>
            )}
          </div>
          <h1 className="text-black text-3xl pt-4">{currentUser?.host?.name || currentUser?.name || 'USER'}</h1>
          {currentUser?.host?.bio && (
            <p className="text-gray-600 text-center mt-2 max-w-sm">{currentUser?.host?.bio || currentUser?.bio}</p>
          )}
          <div className="flex gap-3 p-1 mt-4 font-medium">
            <button className="bg-orange-500 py-2 px-9 rounded-lg text-orange-100 font-semibold flex items-center gap-2">
              Approach
            </button>
            <button className="bg-orange-500 py-2 px-9 rounded-lg text-orange-100 font-semibold flex items-center gap-2">
              Message
            </button>
          </div>
        </div>

        {/* plans */}
        <div className="w-full">
          <h1 className="text-orange-500 text-left py-5 text-2xl font-semibold">Plans</h1>
          <div className="flex-1 max-w-2xl">
            {currentUser?.title ? (
              <div className="grid gap-4">
                {[currentUser].map((plan) => (
                  <div key={plan.id} className="flex items-center p-4 rounded-lg shadow-md bg-white">
                    <div className="mr-4 p-3 bg-gray-100 rounded-xl flex-shrink-0">
                      {getIcon(plan.title)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-left truncate">
                        {plan.title || 'Untitled Plan'}
                      </h3>

                      {/* Start time and Location */}
                      <div className="flex items-center mt-1 text-xs text-gray-500 gap-2">
                        {plan.start_time && (
                          <div className="flex items-center">
                            <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{new Date(plan.start_time).toLocaleString().split(",")[0]}</span>
                          </div>
                        )}

                        {plan.location && (
                          <div className="flex items-center">
                            <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{plan.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full text-center py-8 bg-gray-50 rounded-lg">
                No Plans
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;