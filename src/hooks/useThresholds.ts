import { useState, useEffect } from 'react';
import { Threshold } from '@/types/threshold';

const STORAGE_KEY = 'irreversa-thresholds';

export function useThresholds() {
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      const hydrated = parsed.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        crossedAt: t.crossedAt ? new Date(t.crossedAt) : undefined,
      }));
      setThresholds(hydrated);
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(thresholds));
    }
  }, [thresholds, isLoaded]);

  const addThreshold = (title: string, description: string) => {
    const newThreshold: Threshold = {
      id: crypto.randomUUID(),
      title,
      description,
      createdAt: new Date(),
      isCrossed: false,
    };
    setThresholds((prev) => [...prev, newThreshold]);
    return newThreshold;
  };

  const crossThreshold = (id: string) => {
    setThresholds((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, isCrossed: true, crossedAt: new Date() }
          : t
      )
    );
  };

  const getPendingThresholds = () => thresholds.filter((t) => !t.isCrossed);
  const getCrossedThresholds = () => thresholds.filter((t) => t.isCrossed);

  return {
    thresholds,
    addThreshold,
    crossThreshold,
    getPendingThresholds,
    getCrossedThresholds,
    isLoaded,
  };
}
