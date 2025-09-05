import React, { useState,  useEffect } from 'react';
import { FiMapPin, FiCrosshair } from 'react-icons/fi';

const LocationSelector = ({ initialLocation, onLocationUpdate }) => {
  const [location, setLocation] = useState(initialLocation || 'Select location');
  const [isLoading, setIsLoading] = useState(false);
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const buttonRef = useRef(null);

  // Handle click outside to close dropdown
  // const handleClickOutside = (event) => {
  //   if (buttonRef.current && !buttonRef.current.contains(event.target)) {
  //     // setIsDropdownOpen(false);
  //   }
  // };

  // Add event listener for clicks outside
  // useEffect(() => {
  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, []);

  // Get current location using browser's geolocation and a free reverse geocoding API
  const getCurrentLocation = () => {
    setIsLoading(true);
    
    if (!navigator.geolocation) {
      setLocation('Geolocation not supported');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Using BigDataCloud's reverse geocoding API (free tier available)
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
          );
          
          if (!response.ok) throw new Error('Failed to fetch location data');
          
          const data = await response.json();
          const city = data.city || data.locality || 'Current Location';
          
          setLocation(city);
          onLocationUpdate?.(city);
        } catch (error) {
          console.error('Error getting location:', error);
          // Fallback to just showing coordinates if reverse geocoding fails
          const fallbackText = `Near ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`;
          setLocation(fallbackText);
          onLocationUpdate?.(fallbackText);
        } finally {
          setIsLoading(false);
          // setIsDropdownOpen(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Enable location access';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access was denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        setLocation(errorMessage);
        setIsLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };

  // Get current location on mount if no initial location
  useEffect(() => {
    if (!initialLocation) {
      getCurrentLocation();
    } else {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  // const handleLocationSelect = (selectedLocation) => {
  //   setLocation(selectedLocation);
  //   onLocationUpdate?.(selectedLocation);
  //   // setIsDropdownOpen(false);
  // };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div
        className="flex items-center justify-between w-full px-2 py-2 cursor-pointer"
        // onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
            {isLoading ? 'Detecting location...' : location}
        {/* <div className="flex items-center min-w-0">
          <span className="font-medium text-gray-700 truncate">
          </span>
        </div> */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            getCurrentLocation();
          }}
          className="p-1 text-gray-500 hover:text-orange-500 rounded-full hover:bg-gray-100"
          title="Use current location"
        >
          <FiCrosshair size={18} />
        </button>
      </div>
      
    </div>
  );
};

export default LocationSelector;
