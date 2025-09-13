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

  // Initialize glow mode by checking the user's profile and local storage
  useEffect(() => {
    const initGlowMode = async () => {
      try {
        // First check local storage for quick UI update
        const savedGlowMode = localStorage.getItem('glowMode') === 'true';
        setGlowEnabled(savedGlowMode);
        
        // Then verify with server
        const profile = await authAPI.getProfile();
        if (profile && profile.glow_mode !== undefined) {
          // Only update if different from local storage
          if (savedGlowMode !== profile.glow_mode) {
            setGlowEnabled(profile.glow_mode);
            localStorage.setItem('glowMode', profile.glow_mode.toString());
          }
        }
      } catch (error) {
        console.error('Error initializing glow mode:', error);
        // Fall back to local storage or default to false
        const savedGlowMode = localStorage.getItem('glowMode') === 'true';
        setGlowEnabled(savedGlowMode);
      }
    };
    
    if (isAuthenticated) {
      initGlowMode();
    } else {
      setGlowEnabled(false);
      localStorage.removeItem('glowMode');
    }
  }, [isAuthenticated]);

  // Toggle glow mode
  const toggleGlowMode = async (enabled = !glowEnabled) => {
    try {
      // Update local state immediately for better UX
      setGlowEnabled(enabled);
      localStorage.setItem('glowMode', enabled.toString());
      
      // Update server state
      const response = await userAPI.updateGlowMode(enabled);
      
      // Verify server response matches our state
      if (response && response.glow_mode !== undefined) {
        if (response.glow_mode !== enabled) {
          // If server response doesn't match, sync with server
          setGlowEnabled(response.glow_mode);
          localStorage.setItem('glowMode', response.glow_mode.toString());
        }
      }
      
      // Dispatch custom event for components that need to react to glow mode changes
      window.dispatchEvent(new CustomEvent('glowModeChange', { detail: enabled }));
      
      return true;
    } catch (error) {
      console.error('Error toggling glow mode:', error);
      // Revert to previous state on error
      setGlowMode(!enabled);
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
        await userAPI.updateGlowMode(false);
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
    // setGlowEnabled,
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
