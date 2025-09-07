import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import hangoutService from '../../services/hangoutService';
import { toast } from 'react-toastify';

const CreatePostModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    plan: '',
    location: '',
    time: ''
  });

  // Handle click outside
  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  }, [onClose]);

  // Handle escape key press
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Handle browser back button
  const handlePopState = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      // Add event listeners when modal is open
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      window.addEventListener('popstate', handlePopState);

      // Push a new state to the history to detect back button press
      window.history.pushState({ modalOpen: true }, '');
    }

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      window.removeEventListener('popstate', handlePopState);

      // If the modal is closing and the current state has modalOpen, go back
      if (isOpen && window.history.state?.modalOpen) {
        window.history.back();
      }
    };
  }, [isOpen, handleClickOutside, handleEscapeKey, handlePopState]);

  const validateField = (name, value) => {
    let error = '';
    if (!value.trim()) {
      error = 'This field is required';
    } else if (name === 'time' && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
      error = 'Please enter a valid time (HH:MM)';
    }
    return error;
  };

  const handleInputChange = (field, value) => {
    // Update field value
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validate field if it's been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handleBlur = (field) => (e) => {
    // Mark field as touched
    if (!touched[field]) {
      setTouched(prev => ({
        ...prev,
        [field]: true
      }));
    }

    // Validate field
    const error = validateField(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    // Mark all fields as touched to show errors
    const allTouched = {};
    Object.keys(formData).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    return isValid;
  };

  const formatToISODateTime = (timeString) => {
    if (!timeString) return '';
    
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // Combine with the provided time and add seconds and timezone
    return `${year}-${month}-${day}T${timeString}:00Z`;
  };

  // Multiple geocoding solutions to handle CORS issues
  const getCoordinatesFromAddress = async (address) => {
    // Method 1: Try CORS-enabled proxy for Nominatim
    const corsProxyUrl = 'https://api.allorigins.win/raw?url=';
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    
    try {
      console.log('Attempting geocoding for:', address);
      
      // Try with CORS proxy first
      try {
        const proxyResponse = await fetch(corsProxyUrl + encodeURIComponent(nominatimUrl));
        const proxyData = await proxyResponse.json();
        
        if (proxyData && proxyData[0]) {
          console.log('Geocoding successful via proxy:', proxyData[0]);
          return {
            lat: parseFloat(proxyData[0].lat),
            lon: parseFloat(proxyData[0].lon)
          };
        }
      } catch (proxyError) {
        console.log('Proxy method failed, trying alternatives...');
      }

      // Method 2: Try direct fetch with no-cors mode (limited response access)
      try {
        const directResponse = await fetch(nominatimUrl, { mode: 'no-cors' });
        // Note: no-cors mode doesn't allow reading response, so this won't work for getting data
        // but we include it to show the attempt
      } catch (directError) {
        console.log('Direct fetch failed as expected due to CORS');
      }

      // Method 3: Fallback to predefined city coordinates
      const cityCoordinates = getCityCoordinates(address);
      if (cityCoordinates) {
        console.log('Using predefined coordinates for:', address);
        return cityCoordinates;
      }

      throw new Error('Could not geocode the provided location');
      
    } catch (error) {
      console.error('Error in geocoding:', error);
      
      // Final fallback: try to extract city from address and use predefined coordinates
      const cityCoordinates = getCityCoordinates(address);
      if (cityCoordinates) {
        console.log('Using fallback coordinates for:', address);
        return cityCoordinates;
      }
      
      throw new Error('Could not find coordinates for the provided location. Please try a more specific address or a major city name.');
    }
  };

  // Predefined coordinates for major cities (fallback solution)
  const getCityCoordinates = (address) => {
    const cityDatabase = {
      // India
      'mumbai': { lat: 19.0760, lon: 72.8777 },
      'delhi': { lat: 28.6139, lon: 77.2090 },
      'bangalore': { lat: 12.9716, lon: 77.5946 },
      'chennai': { lat: 13.0827, lon: 80.2707 },
      'kolkata': { lat: 22.5726, lon: 88.3639 },
      'hyderabad': { lat: 17.3850, lon: 78.4867 },
      'pune': { lat: 18.5204, lon: 73.8567 },
      'ahmedabad': { lat: 23.0225, lon: 72.5714 },
      'jaipur': { lat: 26.9124, lon: 75.7873 },
      'lucknow': { lat: 26.8467, lon: 80.9462 },
      
      // International
      'new york': { lat: 40.7128, lon: -74.0060 },
      'london': { lat: 51.5074, lon: -0.1278 },
      'paris': { lat: 48.8566, lon: 2.3522 },
      'tokyo': { lat: 35.6762, lon: 139.6503 },
      'sydney': { lat: -33.8688, lon: 151.2093 },
      'los angeles': { lat: 34.0522, lon: -118.2437 },
      'chicago': { lat: 41.8781, lon: -87.6298 },
      'toronto': { lat: 43.6532, lon: -79.3832 },
      'berlin': { lat: 52.5200, lon: 13.4050 },
      'singapore': { lat: 1.3521, lon: 103.8198 }
    };

    const normalizedAddress = address.toLowerCase().trim();
    
    // Direct match
    if (cityDatabase[normalizedAddress]) {
      return cityDatabase[normalizedAddress];
    }

    // Partial match - check if any city name is contained in the address
    for (const [city, coords] of Object.entries(cityDatabase)) {
      if (normalizedAddress.includes(city) || city.includes(normalizedAddress)) {
        return coords;
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log('Starting hangout creation process...');
      
      // Get coordinates from location name
      const coordinates = await getCoordinatesFromAddress(formData.location);
      console.log('Coordinates obtained:', coordinates);
      
      // Format the time to ISO format with timezone
      const formattedTime = formatToISODateTime(formData.time);
      console.log('Formatted time:', formattedTime);
      
      // Transform the form data to match the required API format
      const hangoutData = {
        title: formData.plan.trim(),
        location: `POINT(${coordinates.lon} ${coordinates.lat})`, // Format as POINT(longitude latitude)
        start_time: formattedTime
      };
      
      console.log("Hangout data being sent:", hangoutData);
      
      const response = await hangoutService.createHangout(hangoutData);
      console.log("Hangout created successfully:", response);
      
      toast.success('Hangout created successfully!');
      
      // Reset form
      setFormData({
        plan: '',
        location: '',
        time: ''
      });
      setErrors({});
      setTouched({});
      
      onClose();
      
    } catch (error) {
      console.error('Error creating hangout:', error);
      
      let errorMessage = 'Failed to create hangout';
      
      if (error.message && error.message.includes('coordinates')) {
        errorMessage = 'Could not find the location. Please try a more specific address or use a major city name.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter key press in form fields
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        plan: '',
        location: '',
        time: ''
      });
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <form
        onSubmit={handleSubmit}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          ref={modalRef}
          className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 19l-7-7 7-7" />
                <path d="M6 12h12" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Make a Plan</h2>
            <div className="w-6"></div> {/* Spacer for centering */}
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-4">
            {/* Plan Description */}
            <div>
              <input
                type="text"
                placeholder="What's the plan..."
                value={formData.plan}
                onChange={(e) => handleInputChange('plan', e.target.value)}
                onBlur={handleBlur('plan')}
                onKeyDown={handleKeyDown}
                className={`w-full px-4 py-3 border ${errors.plan && touched.plan ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5500] focus:border-transparent placeholder-gray-400`}
                required
                disabled={isSubmitting}
              />
              {errors.plan && touched.plan && (
                <p className="mt-1 text-sm text-red-600">{errors.plan}</p>
              )}
            </div>

            {/* Location */}
            <div className="relative">
              <input
                type="text"
                placeholder="Location (e.g., Mumbai, Delhi, Bangalore)"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                onBlur={handleBlur('location')}
                className={`w-full px-4 py-3 border ${errors.location && touched.location ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5500] focus:border-transparent placeholder-gray-400 pr-10`}
                required
                disabled={isSubmitting}
              />
              {errors.location && touched.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            {/* Time */}
            <div className="relative">
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                onBlur={handleBlur('time')}
                className={`w-full px-3 py-2 border ${errors.time && touched.time ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5500] focus:border-transparent`}
                required
                disabled={isSubmitting}
              />
              {errors.time && touched.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time}</p>
              )}
            </div>

            {/* Post Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-2xl w-fit bg-[#ff5500] text-white py-2 px-10 rounded-2xl hover:bg-[#e64d00] transition-colors font-medium mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                'Post'
              )}
            </button>

            {/* Location Help Text */}
            <p className="text-xs text-gray-500 mt-2">
              Tip: Use major city names for better location recognition (e.g., "Mumbai", "Delhi", "Bangalore")
            </p>
          </div>
        </div>
      </form>
    </>
  );
};

export default CreatePostModal;