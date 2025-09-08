import React, { useState, useEffect } from 'react';
import hangoutService from '../../services/hangoutService';
import { FaShoppingBag, FaWalking, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { FaClapperboard } from 'react-icons/fa6';
import { toast } from 'react-toastify';
// import { useAuth } from '../../context/AuthContext';

// Default plans data in case API fails
// const defaultPlans = [
//   {
//     id: 1,
//     title: "Evening Walk",
//     address: "6:00 PM - Gandhi Maidan",
//     start_time: new Date().toISOString(),
//     img: <FaWalking className="text-2xl" />,
//   },
//   {
//     id: 2,
//     title: "Saiyaara",
//     address: "Friday - 9:00 Cinepolis",
//     start_time: new Date().toISOString(),
//     img: <FaClapperboard className="text-2xl" />,
//   },
//   {
//     id: 3,
//     title: "Winter Shopping",
//     address: "Sunday - 4:00 PM - City Centre",
//     start_time: new Date().toISOString(),
//     img: <FaShoppingBag className="text-2xl" />,
//   },
// ];

const PlansSection = (userid) => {
  // const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    start_time: '',
    end_time: '',
    max_participants: 10,
    status: 'active'
  });
  
  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    const fetchPlans = async () => {
      try {
        console.log("Fetching plans...");
        setError(null); // Clear previous errors

        // Add a small delay to prevent race conditions with other API calls
        timeoutId = setTimeout(async () => {
          if (!isMounted) return;
          const response = await hangoutService.getUserHostedHangouts(userid.user);
          console.log("Plans API response:", response);
          
          if (isMounted) {
            // Handle the response structure properly
            const hangouts = response?.hangouts || [];
            
              setPlans(hangouts);
            
          }
        }, 500); // 500ms delay to prevent API conflicts

      } catch (error) {
        console.error("Error in fetchPlans:", error);
        if (isMounted) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to load plans';
          setError(`Error: ${errorMessage}. Using default plans.`);
          
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPlans();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Handle edit button click
  const handleEditClick = (plan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title || '',
      description: plan.description || '',
      address: plan.address || '',
      start_time: plan.start_time ? new Date(plan.start_time).toISOString().slice(0, 16) : '',
      end_time: plan.end_time ? new Date(plan.end_time).toISOString().slice(0, 16) : '',
      max_participants: plan.max_participants || 10,
      status: plan.status || 'active'
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      setIsUpdating(true);
      const updatedPlan = await hangoutService.updateHangout(editingPlan.id, formData);
      
      // Update the plans list with the updated plan
      setPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === editingPlan.id ? { ...plan, ...formData } : plan
        )
      );
      
      toast.success('Plan updated successfully!');
      setEditingPlan(null);
    } catch (error) {
      console.error('Error updating plan:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update plan';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // Format time display
  const formatTimeDisplay = (startTime, endTime, address) => {
    if (address && !startTime) return address; // For default plans
    
    try {
      const start = new Date(startTime);
      const end = endTime ? new Date(endTime) : null;
      
      const timeOptions = { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      };
      
      let timeDisplay = start.toLocaleString('en-US', timeOptions);
      if (end) {
        timeDisplay += ` - ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
      }
      
      return timeDisplay;
    } catch (error) {
      console.error('Error formatting time:', error);
      return address || 'Time not specified';
    }
  };

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Plans</h2>
        </div>
        <div className="text-center py-8 bg-gray-50 rounded-lg animate-pulse">
          <div className="text-gray-500">Loading plans...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Plans</h2>
      </div>
      
      {error && (
        <div className="text-yellow-600 text-center py-2 text-sm bg-yellow-50 rounded-lg border border-yellow-200">
          {error}
        </div>
      )}
      
      {plans.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
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
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className="flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
            >
              <div className="mr-4 p-3 bg-gray-100 rounded-full flex-shrink-0">
                {getIcon(plan)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">
                  {plan.title || 'Untitled Plan'}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {formatTimeDisplay(plan.start_time, plan.end_time, plan.address)}
                </p>
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
              <button
                className="ml-4 border border-orange-500 text-orange-500 hover:bg-orange-50 py-2 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleEditClick(plan)}
                disabled={isUpdating}
              >
                {isUpdating && editingPlan?.id === plan.id ? 'Updating...' : 'Update'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Update Plan</h2>
                <button 
                  onClick={() => setEditingPlan(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isUpdating}
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
          
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
            
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
            
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                      <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        name="end_time"
                        value={formData.end_time}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
                    </div>
                  </div>
                </div>
            
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter location"
                    />
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>
            
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="max_participants"
                      min="1"
                      max="100"
                      value={formData.max_participants}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <FaUsers className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>
            
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
            
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors flex items-center disabled:opacity-50"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : 'Update Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansSection;