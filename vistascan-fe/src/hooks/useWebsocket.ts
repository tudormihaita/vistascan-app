import { useEffect, useRef } from 'react';
import { websocketService } from '../services/websocketService';
import { LocalStorageKeys } from '../types/enums/LocalStorageKeys';

export const useWebSocket = () => {
  const hasInitialized = useRef(false);
  const token = localStorage.getItem(LocalStorageKeys.USER_TOKEN);

  useEffect(() => {
    if (!hasInitialized.current && token) {
      hasInitialized.current = true;
      websocketService.connect();

      return () => {
        websocketService.disconnect();
        hasInitialized.current = false;
      };
    }
  }, [token]);

  useEffect(() => {
    if (token && !websocketService.isConnected()) {
      websocketService.connect();
    } else if (!token && websocketService.isConnected()) {
      websocketService.disconnect();
    }
  }, [token]);

  return websocketService;
};