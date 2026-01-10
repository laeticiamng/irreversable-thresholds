import { useState, useEffect } from 'react';
import { Absence, AbsenceEffect } from '@/types/absence';

const STORAGE_KEY = 'nulla-absences';

export function useAbsences() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const hydrated = parsed.map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt),
        effects: a.effects.map((e: any) => ({
          ...e,
          createdAt: new Date(e.createdAt),
        })),
      }));
      setAbsences(hydrated);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(absences));
    }
  }, [absences, isLoaded]);

  const addAbsence = (title: string, description: string) => {
    const newAbsence: Absence = {
      id: crypto.randomUUID(),
      title,
      description,
      createdAt: new Date(),
      effects: [],
    };
    setAbsences((prev) => [...prev, newAbsence]);
    return newAbsence;
  };

  const addEffect = (absenceId: string, type: AbsenceEffect['type'], description: string) => {
    setAbsences((prev) =>
      prev.map((a) =>
        a.id === absenceId
          ? {
              ...a,
              effects: [
                ...a.effects,
                {
                  id: crypto.randomUUID(),
                  type,
                  description,
                  createdAt: new Date(),
                },
              ],
            }
          : a
      )
    );
  };

  const getAbsenceById = (id: string) => absences.find((a) => a.id === id);

  return {
    absences,
    addAbsence,
    addEffect,
    getAbsenceById,
    isLoaded,
  };
}
