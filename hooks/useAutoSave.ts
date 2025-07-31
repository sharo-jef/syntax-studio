import { useEffect, useRef, useCallback } from 'react';

export const useAutoSave = (
  value: string,
  onSave: (value: string) => void,
  delay: number = 500
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<string>(value);
  const lastSaveTimeRef = useRef<number>(Date.now());
  const onSaveRef = useRef(onSave);

  // Update onSave function reference (to exclude from useEffect dependencies)
  useEffect(() => {
    onSaveRef.current = onSave;
  });

  useEffect(() => {
    // Process only when value changes
    if (value !== previousValueRef.current) {
      // Clear existing timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timer
      timeoutRef.current = setTimeout(() => {
        const now = Date.now();
        // Save only if enough time has passed since the last save
        if (now - lastSaveTimeRef.current >= delay / 2) {
          onSaveRef.current(value);
          previousValueRef.current = value;
          lastSaveTimeRef.current = now;
        }
      }, delay);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]); // Exclude onSave from dependencies

  // Provide function to save immediately
  const saveImmediately = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (value !== previousValueRef.current) {
      onSaveRef.current(value);
      previousValueRef.current = value;
      lastSaveTimeRef.current = Date.now();
    }
  }, [value]);

  // Final save on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Save immediately if there are unsaved changes
      if (value !== previousValueRef.current) {
        onSaveRef.current(value);
      }
    };
  }, []); // Empty dependency array to execute only on unmount

  return { saveImmediately };
};
