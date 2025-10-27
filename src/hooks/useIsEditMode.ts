import { useEffect, useState } from 'react';

/**
 * Custom hook to check if edit mode is enabled via URL parameter
 * @returns boolean - true only when isEditMode query parameter is present and true
 */
export const useIsEditMode = (): boolean => {
  const [isEditModeActivated, setIsEditModeActivated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkEditMode = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlEditMode = urlParams.get('isEditMode') === 'true';
      setIsEditModeActivated(urlEditMode);
    };

    // Check on mount
    checkEditMode();

    // Listen for URL changes (popstate for back/forward navigation)
    window.addEventListener('popstate', checkEditMode);
    
    // Listen for location changes in React Router
    const handleLocationChange = () => {
      setTimeout(checkEditMode, 0); // Ensure URL is updated
    };
    
    window.addEventListener('hashchange', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', checkEditMode);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  return isEditModeActivated;
};