import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaWalking, FaShoppingBag } from 'react-icons/fa';
import { FaClapperboard } from "react-icons/fa6";
import { samplePlans } from '../../public/samplePlans';

const interests = ["Movies", "Coffee", "Gym", "Walk"];

// Default plans data in case API fails
const defaultPlans = [
  {
    id: 1,
    title: "Evening Walk",
    address: "6:00 PM - Gandhi Maidan",
    start_time: new Date().toISOString(),
    img: <FaWalking className="text-7xl" />,
  },
  {
    id: 2,
    title: "Saiyaara",
    address: "Friday - 9:00 Cinepolis",
    start_time: new Date().toISOString(),
    img: <FaClapperboard className="text-7xl" />,
  },
  {
    id: 3,
    title: "Winter Shopping",
    address: "Sunday - 4:00 PM - City Centre",
    start_time: new Date().toISOString(),
    img: <FaShoppingBag className="text-7xl" />,
  },
];

const UserProfile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  console.log(currentUser);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  // const [profileError, setProfileError] = useState(null);

  //get id
  const { id } = useParams();

  useEffect(() => {
    setCurrentUser(samplePlans.filter((user) => user.id === id)[0]);
    setIsLoadingProfile(false);
  }, [])

  const nameFirstLetter = currentUser?.name?.charAt(0)?.toUpperCase() || '?';

  // Get appropriate icon based on title or tags
  const getIcon = (plan) => {
    if (plan.img) return plan.img; // For default plans

    const title = plan.title?.toLowerCase() || '';
    const tags = plan.tags || [];
    const allText = (title + ' ' + tags.join(' ')).toLowerCase();

    if (allText.includes('coffee') || allText.includes('cafe')) {
      return <div className="text-2xl">☕</div>;
    }
    if (allText.includes('movie') || allText.includes('cinema') || allText.includes('film')) {
      return <FaClapperboard className="text-2xl" />;
    }
    if (allText.includes('walk') || allText.includes('stroll')) {
      return <FaWalking className="text-2xl" />;
    }
    if (allText.includes('shop') || allText.includes('mall') || allText.includes('store')) {
      return <FaShoppingBag className="text-2xl" />;
    }

    // Default icon
    return <div className="text-2xl">📅</div>;
  };


  // Loading state for profile
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

  return (
    <>
      <div className="min-h-screen bg-white pb-6">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
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
              <div className="bg-white border border-gray-200 rounded-full px-3 py-1 flex items-center gap-1">
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
                <div className="flex-1">
                  <div className="flex items-center font-semibold text-black">
                    {/* <LocationSelector
                      initialLocation={location}
                      onLocationUpdate={handleLocationUpdate}
                    /> */}
                    {currentUser?.address}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile section */}
        <div className="flex flex-col md:flex-row gap-7 lg:gap-20 xl:gap-32 p-8 lg:px-20 xl:px-30">
          <div className="flex flex-col justify-center items-center">
            <div className="rounded-full border overflow-hidden">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser?.name || "User"}
                  className="w-[150px] h-[150px] md:h-[300px] md:w-[300px] rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-[150px] h-[150px] md:h-[300px] md:w-[300px] flex items-center justify-center bg-gray-200 text-6xl font-bold rounded-full"
                style={{ display: currentUser?.avatarUrl ? 'none' : 'flex' }}
              >
                {nameFirstLetter}
              </div>
            </div>
            <h1 className="text-black text-3xl pt-4">{currentUser?.name || 'Loading...'}</h1>
            {currentUser?.bio && (
              <p className="text-gray-600 text-center mt-2 max-w-sm">{currentUser.bio}</p>
            )}
            <div className="flex gap-4 mt-4 p-1">
              {interests.map((hobby, index) => (
                <button
                  key={index}
                  className="bg-gray-300 text-gray-600 p-1.5 rounded-lg cursor-pointer hover:bg-gray-400 transition-colors"
                >
                  {hobby}
                </button>
              ))}
            </div>
            <div className="flex gap-3 p-1 mt-4 font-medium">
              <button className="bg-orange-500 py-2 px-9 rounded-lg cursor-pointer text-orange-100 font-semibold transition-colors flex items-center gap-2">
                Approach
              </button>
              <button className="bg-orange-500 py-2 px-9 rounded-lg cursor-pointer text-orange-100 font-semibold transition-colors flex items-center gap-2">
                Message
              </button>
            </div>
          </div>
          <div className="w-full">
            <h1 className="text-orange-500 text-left py-5 text-2xl font-semibold">Plans</h1>
            <div className="flex-1 max-w-2xl">
              {/* <PlanSection User={currentUser}  /> */}
              {defaultPlans.length === 0 ? (
                <div className="w-full text-center py-8 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-gray-500 mb-2">No plans found.</p>
                  <button
                    className="text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
                    onClick={() => console.log('Create new plan')}
                  >
                    Create your first plan
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {defaultPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center p-4 rounded-lg shadow-md bg-white"
                    >
                      <div className="mr-4 p-3 bg-gray-100 rounded-xl flex-shrink-0">
                        {getIcon(plan)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-left truncate">
                          {plan.title || 'Untitled Plan'}
                        </h3>
                        {/* <p className="text-sm text-gray-600 truncate">
                              {formatTimeDisplay(plan.start_time, plan.end_time, plan.address)}
                            </p> */}
                        {plan.address && (
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{plan.address}</span>
                          </div>
                        )}
                        {plan.tags && plan.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {plan.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {plan.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{plan.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {/* <div className="flex gap-2">
                      <button
                        className="border border-orange-500 text-orange-500 hover:bg-orange-50 py-2 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleEditClick(plan)}
                        disabled={isUpdating}
                      >
                        {isUpdating && editingPlan?.id === plan.id ? 'Updating...' : 'Update'}
                      </button>
                      <button
                        className="border border-red-500 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleDeletePlan(plan.id)}
                        disabled={isDeleting}
                        title="Delete plan"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div> */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plan Requests Section */}
        {/* <div className="mt-10 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="w-full mb-6">
            <div className="inline-flex items-center gap-3 pb-2 border-b-2 border-stone-800">
              <FaCalendar className="text-2xl sm:text-3xl text-stone-800" />
              <h1 className="text-2xl sm:text-3xl font-medium text-stone-800">Plan Requests</h1>
            </div>
          </div>
          
          <div className="space-y-4">
            {planRequests.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-lg">
                <FaHourglass className="mx-auto text-4xl sm:text-5xl mb-3 text-stone-400" />
                <p className="text-stone-500 text-lg">No pending plan requests</p>
              </div>
            ) : (
              planRequests.map((request) => (
                <div 
                  key={request.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5 border border-stone-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl sm:text-4xl bg-stone-100 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0">
                    {request.requester.avatar}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-stone-800 mb-1">{request.title}</h3>
                    <p className="text-sm text-stone-600 mb-2">From: {request.requester.name}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-stone-600">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-stone-400" />
                        <span className="truncate">{request.location}</span>
                      </div>
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-stone-400" />
                        <span>{new Date(request.time).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-col-reverse gap-2 sm:gap-3 mt-2 sm:mt-0">
                    {request.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="flex items-center justify-center px-4 py-2 text-sm sm:text-base font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <FaCheck className="mr-2" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="flex items-center justify-center px-4 py-2 text-sm sm:text-base font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <FaTimes className="mr-2" /> Reject
                        </button>
                      </>
                    ) : request.status === 'approved' ? (
                      <div className="flex flex-col gap-3">
                        <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full text-center">
                          Approved
                        </span>
                        <button
                          onClick={() => navigateToChat(request)}
                          className="flex items-center justify-center px-4 py-2 text-sm sm:text-base font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <FaComment className="mr-2" /> Chat Now
                        </button>
                      </div>
                    ) : (
                      <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full text-center cursor-pointer">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div> */}
      </div>
    </>
  );
};

export default UserProfile;