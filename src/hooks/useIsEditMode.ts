import { useMemo } from 'react';

/**
 * Custom hook to check if edit mode is enabled via URL parameter
 * @returns boolean - true if ?isEditMode=true is present in URL
 */
export const useIsEditMode = (): boolean => {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('isEditMode') === 'true';
  }, []);
};