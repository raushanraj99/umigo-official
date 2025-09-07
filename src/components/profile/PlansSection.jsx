import React, { useState, useEffect } from 'react';
import hangoutService from '../../services/hangoutService';
import { FaShoppingBag, FaWalking } from 'react-icons/fa';
import { FaClapperboard } from 'react-icons/fa6';

// Default plans data in case API fails
const defaultPlans = [
  {
    id: 1,
    title: "Evening Walk",
    address: "6:00 PM - Gandhi Maidan",
    start_time: new Date().toISOString(),
    img: <FaWalking className="text-2xl" />,
  },
  {
    id: 2,
    title: "Saiyaara",
    address: "Friday - 9:00 Cinepolis",
    start_time: new Date().toISOString(),
    img: <FaClapperboard className="text-2xl" />,
  },
  {
    id: 3,
    title: "Winter Shopping",
    address: "Sunday - 4:00 PM - City Centre",
    start_time: new Date().toISOString(),
    img: <FaShoppingBag className="text-2xl" />,
  },
];

const PlansSection = () => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

          const response = await hangoutService.getHangouts({
            limit: 10,
          });
          
          console.log("Plans API response:", response);
          
          if (isMounted) {
            // Handle the response structure properly
            const hangouts = response?.hangouts || [];
            if (hangouts.length > 0) {
              setPlans(hangouts);
            } else {
              console.log("No hangouts found, using default plans");
              setPlans(defaultPlans);
            }
          }
        }, 500); // 500ms delay to prevent API conflicts

      } catch (error) {
        console.error("Error in fetchPlans:", error);
        if (isMounted) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to load plans';
          setError(`Error: ${errorMessage}. Using default plans.`);
          console.log("Using default plans due to error");
          setPlans(defaultPlans);
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
          <div className="text-sm text-orange-500">+ Add Plan</div>
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
        <button 
          className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
          onClick={() => console.log('Create new plan')}
        >
          + Add Plan
        </button>
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
                className="ml-4 border border-orange-500 text-orange-500 hover:bg-orange-50 py-2 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
                onClick={() => console.log('View plan details:', plan.id)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlansSection;