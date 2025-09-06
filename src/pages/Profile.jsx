import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/authService";
import { FaCalendar, FaWalking, FaShoppingBag, FaEdit } from "react-icons/fa";
import { FaClapperboard } from "react-icons/fa6";
import LocationSelector from "./components/LocationSelector";
import MyEditProfile from "./components/Profilecomponents/MyEditProfile";

const interests = ["Movies", "Coffee", "Gym", "Walk"];
const plans = [
  {
    plan: "Evening Walk",
    timePlace: "6:00 PM - Gandhi Maidan",
    img: <FaWalking />,
  },
  {
    plan: "Saiyaara",
    timePlace: "Friday - 9:00 Cinepolis",
    img: <FaClapperboard />,
  },
  {
    plan: "Winter Shopping",
    timePlace: "Sunday - 4:00 PM - City Centre",
    img: <FaShoppingBag />,
  },
];

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [location, setLocation] = useState("Current Location");
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userInfo = await authAPI.getProfile();
        setCurrentUser(userInfo.user);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLocationUpdate = (newLocation) => {
    setLocation(newLocation);
    // Here you can add API call to save the location to the user's profile
    // Example API call:
    // await updateUserProfile({ location: newLocation });
  };

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    updateUser(updatedUser);
  };

  const nameFirstLetter = currentUser?.name?.charAt(0);

  return (
    <>
      {showEditProfile && (
        <MyEditProfile 
          onClose={() => setShowEditProfile(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
      {
        <div className="min-h-screen bg-white">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <div className="bg-white border border-gray-200 rounded-full px-3 py-1 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {/* <span className="text-sm text-gray-700">Bangalore</span> */}
                  <div className="flex-1 mx-4">
                    <div className="flex items-center">
                      <LocationSelector
                        initialLocation={location}
                        onLocationUpdate={handleLocationUpdate}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* profile section */}
          <div className="flex justify-center flex-col md:flex-row gap-7 p-8">
            <div className="flex flex-col justify-center items-center">
              <div className="rounded-full border overflow-hidden">
                {/* {
                  currentUser?.image_url ? (
                    <img
                      src={currentUser.image_url}
                      alt={currentUser?.name || "User"}
                      className="h-[300px] w-[300px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-[300px] w-[300px] flex items-center justify-center bg-gray-200 text-6xl font-bold rounded-full">
                      {nameFirstLetter}
                    </div>
                  )
                } */}
                <div className="h-[300px] w-[300px] flex items-center justify-center bg-gray-200 text-6xl font-bold rounded-full">
                  {nameFirstLetter}
                </div>
              </div>
              <h1 className=" text-black text-3xl pt-4">{currentUser?.name}</h1>
              <div className="flex gap-4 mt-4 p-1">
                {interests.map((hobby, index) => (
                  <button
                    key={index}
                    className="bg-gray-300 text-gray-600 p-1.5 rounded-lg cursor-pointer"
                  >
                    {hobby}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 p-1 mt-4 font-medium">
                <button 
                  className="border border-orange-500 py-2 px-9 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors"
                  onClick={() => setShowEditProfile(true)}
                >
                  Edit Profile
                </button>
                <button className="border border-orange-500 py-2 px-9 rounded-lg cursor-pointer">
                  Plan
                </button>
              </div>
            </div>
            <div>
              <div className="w-full">
                <span className="text-left inline-flex text-stone-800 text-3xl font-normal items-center gap-3 pb-3 px-2 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-stone-800">
                  <FaCalendar />
                  <h1>Plans</h1>
                </span>
              </div>
              <div className="text-stone-800 space-y-3.5 p-5">
                {plans.map((plan, index) => (
                  <div
                    className="flex gap-5 items-center justify-between border border-stone-400 rounded-lg p-4"
                    key={index}
                  >
                    <div className="text-7xl text-stone-500">{plan.img}</div>
                    <div className="text-left">
                      <h2 className="text-2xl">{plan.plan}</h2>
                      <h4 className="text-stone-500 text-xs">
                        {plan.timePlace}
                      </h4>
                    </div>
                    <button className="border border-orange-500 py-2 px-9 rounded-lg cursor-pointer">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    </>
  );
};

export default Profile;
