// src/context/HangoutContext.jsx
import { createContext, useContext } from 'react';
import hangoutService from '../services/hangoutService';

const HangoutContext = createContext();

export const HangoutProvider = ({ children }) => {
  // Hangout methods
  const createHangout = hangoutService.createHangout;
  const getHangouts = hangoutService.getHangouts;
  const getHangoutDetails = hangoutService.getHangoutDetails;
  const updateHangout = hangoutService.updateHangout;
  const deleteHangout = hangoutService.deleteHangout;
  const joinHangout = hangoutService.joinHangout;
  const hasUserJoinedHangout = hangoutService.hasUserJoinedHangout;
  const getJoinRequests = hangoutService.getJoinRequests;
  const updateJoinRequest = hangoutService.updateJoinRequest;
  const getUserHostedHangouts = hangoutService.getUserHostedHangouts;
  const getUserJoinedHangouts = hangoutService.getUserJoinedHangouts;
  const getNearbyHangouts = hangoutService.getNearbyHangouts;

  const value = {
    createHangout,
    getHangouts,
    getHangoutDetails,
    updateHangout,
    deleteHangout,
    joinHangout,
    hasUserJoinedHangout,
    getJoinRequests,
    updateJoinRequest,
    getUserHostedHangouts,
    getUserJoinedHangouts,
    getNearbyHangouts,
  };

  return (
    <HangoutContext.Provider value={value}>
      {children}
    </HangoutContext.Provider>
  );
};

export const useHangout = () => {
  const context = useContext(HangoutContext);
  if (!context) {
    throw new Error('useHangout must be used within a HangoutProvider');
  }
  return context;
};