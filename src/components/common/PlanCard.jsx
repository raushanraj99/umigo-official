import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import hangoutService from '../../services/hangoutService';

/**
 * PlanCard Component
 *
 * Displays a hangout/event card with join functionality.
 * When hangoutId is provided, uses real API to join hangouts.
 * When onJoin callback is provided, calls it for backward compatibility.
 *
 * @param {string} bannerImage - URL for the banner image
 * @param {string} avatarUrl - URL for the user avatar image
 * @param {string} name - Name of the hangout host
 * @param {string} subtitle - Subtitle or activity type
 * @param {string} start_time - Start time of the hangout
 * @param {string} location - Location of the hangout
 * @param {function} onCardClick - Callback when card is clicked
 * @param {function} onJoin - Callback when join is clicked (optional)
 * @param {boolean} glow - Whether to show glow effect
 * @param {boolean} join - Initial join state (for backward compatibility)
 * @param {string} className - Additional CSS classes
 * @param {string} hangoutId - Hangout ID for API calls (required for API integration)
 */
function PlanCard({
  bannerImage,
  avatarUrl,
  name,
  subtitle,
  start_time,
  location,
  onCardClick,
  onJoin,
  glow = false,
  join,
  className = '',
  hangoutId, // Added hangoutId prop for API calls
}) {
  const [isJoining, setIsJoining] = useState(false);
  const [hasRequested, setHasRequested] = useState(join);

  // Sync local state with join prop when it changes externally
  useEffect(() => {
    setHasRequested(join);
  }, [join]);

  const handleJoinClick = async (e) => {
    // Stop event propagation to prevent card click
    e.stopPropagation();

    // If already requested or currently joining, don't do anything
    if (hasRequested || isJoining) {
      return;
    }

    // Call onJoin callback if it exists (for backward compatibility)
    if (onJoin) {
      onJoin(e, false); // Pass false to indicate not using API
      return;
    }

    // If no hangoutId provided, show error
    if (!hangoutId) {
      toast.error('Unable to join hangout - missing hangout information');
      return;
    }

    try {
      setIsJoining(true);

      // Make API call to join hangout using POST /api/hangouts/:id/join
      const response = await hangoutService.joinHangout(hangoutId);

      // Update local state to show "Requested" status
      setHasRequested(true);

      // Notify parent component of the change
      if (onJoin) {
        onJoin(e, true); // Pass true to indicate successful join
      }

      toast.success(`Join request sent for ${name}'s hangout!`, {
        position: 'top-center',
        autoClose: 3000,
      });

      console.log('Join request successful:', response);
    } catch (error) {
      console.error('Error joining hangout:', error);

      let errorMessage = 'Failed to send join request';
      if (error.response?.status === 401) {
        errorMessage = 'Please log in to join hangouts';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to join this hangout';
      } else if (error.response?.status === 404) {
        errorMessage = 'Hangout not found or no longer available';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 4000,
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div
      onClick={onCardClick}
      className={[
        'relative bg-white rounded-2xl shadow-sm overflow-hidden w-full max-w-md mx-auto cursor-pointer transition-transform hover:scale-[1.02]',
        glow ? ' ring-[#ff5500]/30 shadow-[0_0_24px_rgba(255,85,0,0.18)]' : '',
        className,
      ].join(' ')}
    >
      {/* Banner */}
      <div
        className="relative h-28 w-full bg-cover bg-center"
        style={{ backgroundImage: bannerImage ? `url(${bannerImage})` : 'none' }}
      >
        <div className="relative inset-0 bg-[#ff5500]/10 z-0" />
        {/* Avatar overlapping the banner */}
        <img
          src={avatarUrl}
          alt={name}
          className="absolute -bottom-12 left-4 h-24 w-24 rounded-full object-cover ring-4 ring-white z-10"
        />
        <div className="absolute -bottom-8 left-30 text-lg mr-14 font-normal text-[#000000]">{name}</div>
      </div>

      {/* Content */}
      <div className="w-full p-4 pt-14 flex justify-between">
        <div>
          {subtitle && (
            <div className="mt-3 text-[#1c1c1c] flex items-center font-bold text-xl gap-2">
              {/* <span role="img" aria-label="place">🛒</span> */}
              <span>{subtitle}</span>
            </div>
          )}
          {location && (
            <div className=" text-[#1c1c1c] flex items-center gap-1">
              {/* <span role="img" aria-label="place">📍</span> */}
              <span className="opacity-60 text-sm">
                {location.length > 30 ? `${location.slice(0, 30)}...` : location}
              </span>
            </div>
          )
          }
        </div>
        {/* Join button */}
        <button
          onClick={handleJoinClick}
          className={`h-fit px-4 py-2 mt-5 rounded-xl whitespace-nowrap z-10 cursor-pointer transition-all duration-300 text-[16px] ${
            hasRequested || isJoining
              ? 'bg-white text-[#ff5500] border border-[#ff5500] cursor-not-allowed'
              : 'bg-[#ff5500] text-white hover:bg-[#e64d00]'
          }`}
          // disabled={hasRequested || isJoining}
        >
          {/* {isJoining ? "Sending..." : hasRequested ? "joined" : "Join to chat"} */}
          Join to Chat
        </button>

        {/* {subtitle && (
          <div className="mt-3 text-[#2b2b2b] flex items-center gap-2">
            <span role="img" aria-label="place">🛒</span>
            <span className="opacity-90">{subtitle}</span>
          </div>
        )} */}
      </div>
    </div>
  );
}

export default PlanCard;
