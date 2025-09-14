import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/authService';
import { useAuth } from './AuthContext';

const CommonContext = createContext();

export function CommonProvider({ children }) {
  // Search state
  const [showSearch, setShowSearch] = useState(false);
  // Initialize glow mode state
  const [glowEnabled, setGlowEnabled] = useState(false);
  const [glowBtnVisible, setGlowBtnVisible] = useState(true);
  const [glowUsers, setGlowUsers] = useState([]);
  const { isAuthenticated } = useAuth();

  // Check glow mode status from server
  const checkGlowModeStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setGlowEnabled(false);
      setGlowUsers([]);
      return false;
    }

    try {
      const glowUsers = await userAPI.getGlowUsers();
      const isUserInGlowMode = Array.isArray(glowUsers) && glowUsers.length > 0;
      setGlowEnabled(isUserInGlowMode);
      setGlowUsers(glowUsers || []);
      return isUserInGlowMode;
    } catch (error) {
      console.error('Error checking glow mode status:', error);
      // Only update state if we're still authenticated
      if (isAuthenticated) {
        setGlowEnabled(false);
        setGlowUsers([]);
      }
      return false;
    }
  }, [isAuthenticated]);

  // Check glow mode status on mount and when auth state changes
  useEffect(() => {
    checkGlowModeStatus();
  }, [checkGlowModeStatus]);

  // Toggle glow mode
  const toggleGlowMode = async (enabled = !glowEnabled) => {
    try {
      // Update server state first
      const response = await userAPI.updateGlowMode(enabled);
      
      // Verify server response matches our state
      if (response && response.glow_mode !== undefined) {
        // Sync with server response
        setGlowEnabled(response.glow_mode);
        // If disabling, clear glowUsers
        if (!response.glow_mode) {
          setGlowUsers([]);
        } else {
          // If enabling, fetch latest glow users
          const updatedGlowUsers = await userAPI.getGlowUsers();
          setGlowUsers(updatedGlowUsers || []);
        }
      } else {
        // If no glow_mode in response, check status from server
        await checkGlowModeStatus();
      }
      
      // Dispatch custom event for components that need to react to glow mode changes
      window.dispatchEvent(new CustomEvent('glowModeChange', { detail: enabled }));
      
      return true;
    } catch (error) {
      console.error('Error toggling glow mode:', error);
      // Revert to previous state on error
      setGlowEnabled(!enabled);
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
    setGlowEnabled,
    glowBtnVisible,
    glowUsers,
    setGlowUsers,
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
