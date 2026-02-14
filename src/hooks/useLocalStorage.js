/**
 * useLocalStorage Hook - State persistence
 */
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // Get stored value or use initial
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// Storage keys used in the app
export const STORAGE_KEYS = {
  favorites: 'tastetrace_favorites',
  achievements: 'tastetrace_achievements',
  tasteProfile: 'tastetrace_profile',
  stats: 'tastetrace_stats',
  language: 'tastetrace_language',
  sessionId: 'tastetrace_session'
};

// Helper functions
export const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or disabled
  }
};

export default useLocalStorage;
