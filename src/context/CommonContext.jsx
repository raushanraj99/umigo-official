import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI, authAPI } from '../services/authService';

const CommonContext = createContext();

export function CommonProvider({ children }) {
  // Search state
  const [showSearch, setShowSearch] = useState(false);
  // Glow mode state
  const [glowEnabled, setGlowEnabled] = useState(false);
  const [glowBtnVisible, setGlowBtnVisible] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize glow mode by checking the user's profile
  useEffect(() => {
    const initGlowMode = async () => {
      try {
        // Get current user's profile which should include glow mode status
        const profile = await authAPI.getProfile();
        // Check if the profile has glow mode status
        if (profile && profile.glow_mode !== undefined) {
          setGlowEnabled(profile.glow_mode);
        } else {
          // Default to false if not specified
          setGlowEnabled(false);
        }
      } catch (error) {
        console.error('Error checking glow mode:', error);
        setGlowEnabled(false);
      }
    };
    
    if (isAuthenticated) {
      initGlowMode();
    } else {
      setGlowEnabled(false);
    }
  }, [isAuthenticated]);

  // Toggle glow mode
  const toggleGlowMode = async () => {
    try {
      const newValue = !glowEnabled;
      if (newValue) {
        // Enable glow mode
        await userAPI.updateGlowMode(true);
      } else {
        // Disable glow mode
        await userAPI.disableGlowMode();
      }
      setGlowEnabled(newValue);
      return true;
    } catch (error) {
      console.error('Error toggling glow mode:', error);
      return false;
    }
  };

  // Set glow mode to a specific value
  const setGlowMode = async (value) => {
    if (value === glowEnabled) return true;
    try {
      if (value) {
        // Enable glow mode
        await userAPI.updateGlowMode(true);
      } else {
        // Disable glow mode
        await userAPI.disableGlowMode();
      }
      setGlowEnabled(value);
      return true;
    } catch (error) {
      console.error('Error setting glow mode:', error);
      return false;
    }
  };

  // Search handlers
  const toggleSearch = () => setShowSearch(prev => !prev);
  const openSearch = () => setShowSearch(true);
  const closeSearch = () => setShowSearch(false);
  const setGlowButtonVisibility = (isVisible) => setGlowBtnVisible(isVisible);

  const value = {
    // Search
    showSearch,
    toggleSearch,
    openSearch,
    closeSearch,
    
    // Glow Mode
    glowEnabled,
    glowBtnVisible,
    toggleGlowMode,
    setGlowMode,
    setGlowButtonVisibility
  };

  return (
    <CommonContext.Provider value={value}>
      {children}
    </CommonContext.Provider>
  );
}

export function useCommon() {
  const context = useContext(CommonContext);
  if (!context) {
    throw new Error('useCommon must be used within a CommonProvider');
  }
  return context;
}
