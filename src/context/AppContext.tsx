// NOTA: Las imágenes y datos de ciudades se guardan en IndexedDB (ver src/db.ts), lo que asegura persistencia local incluso tras recargar la página.
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Salon, State, City, EventItem } from '../types';
import { mexicanStates, mexicanCities } from '../data';
import { loadSalones, loadCities, saveSalones, saveCities, loadEvents, saveEvents } from '../db';

interface AppContextType {
  states: State[];
  cities: City[];
  salones: Salon[];
  events: EventItem[];
  selectedState: State | null;
  selectedCity: City | null;
  setSelectedState: (state: State | null) => void;
  setSelectedCity: (city: City | null) => void;
  addSalon: (salon: Salon) => void;
  updateSalon: (id: string, salon: Partial<Salon>) => void;
  deleteSalon: (id: string) => void;
  getSalonsByCity: (cityName: string, stateName: string) => Salon[];
  addCity: (stateName: string, cityName: string, coverImage?: string) => void;
  updateCityImage: (cityId: string, coverImage: string | null) => void;
  deleteCity: (cityId: string) => void;
  addState: (stateName: string) => void;
  editStateImage: (stateId: string, backgroundImage: string | null) => void;
  addEvent: (event: EventItem) => void;
  updateEvent: (id: string, data: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  exportData: () => BackupPayload;
  importData: (data: BackupPayload) => void;
}
 

interface BackupPayload {
  version: number;
  states: State[];
  cities: City[];
  salones: Salon[];
  events: EventItem[];
}
import { loadStates, saveStates } from '../db';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const editStateImage = (stateId: string, backgroundImage: string | null) => {
    setStates((states: State[]) =>
      states.map((state: State) =>
        state.id === stateId
          ? { ...state, backgroundImage: backgroundImage || undefined }
          : state
      )
    );
  };
  const [states, setStates] = useState<State[]>(mexicanStates);
  const [cities, setCities] = useState<City[]>([]);
  const [salones, setSalones] = useState<Salon[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const initialized = useRef(false);

  const updateCityImage = (cityId: string, coverImage: string | null) => {
    setCities((cities: City[]) =>
      cities.map((city: City) =>
        city.id === cityId
          ? { ...city, coverImage: coverImage || undefined }
          : city
      )
    );
  };

  const buildInitialCities = () => {
    const initialCities: City[] = [];
    Object.entries(mexicanCities).forEach(([stateId, cityNames]) => {
      cityNames.forEach((cityName, index) => {
        initialCities.push({
          id: `${stateId}-${index}`,
          stateId,
          name: cityName,
        });
      });
    });
    return initialCities;
  };

  // Load from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dbSalones, dbCities, dbStates, dbEvents] = await Promise.all([
          loadSalones(),
          loadCities(),
          loadStates(),
          loadEvents(),
        ]);

        if (cancelled) return;

        if (dbSalones) {
          setSalones(dbSalones);
        }

        if (dbCities) {
          setCities(dbCities);
        } else {
          setCities(buildInitialCities());
        }

        if (dbStates) {
          setStates(dbStates);
        }

        if (dbEvents) {
          setEvents(dbEvents);
        }
      } catch {
        if (!cancelled) {
          setCities(buildInitialCities());
        }
      } finally {
        if (!cancelled) {
          initialized.current = true;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Save salones to IndexedDB whenever they change
  useEffect(() => {
    if (!initialized.current) return;
    saveSalones(salones).catch(() => {
      /* ignore write failures */
    });
  }, [salones]);

  // Save events to IndexedDB whenever they change
  useEffect(() => {
    if (!initialized.current) return;
    saveEvents(events).catch(() => {
      /* ignore write failures */
    });
  }, [events]);

  // Save cities to IndexedDB whenever they change
  useEffect(() => {
    if (!initialized.current) return;
    saveCities(cities).catch(() => {
      /* ignore write failures */
    });
  }, [cities]);

  // Save states to IndexedDB whenever they change
  useEffect(() => {
    if (!initialized.current) return;
    saveStates(states).catch(() => {
      /* ignore write failures */
    });
  }, [states]);

  const getSalonsByCity = (cityName: string, stateName: string): Salon[] => {
    return salones.filter(
      salon => salon.city === cityName && salon.state === stateName
    );
  };

  const addSalon = (salon: Salon) => {
    const updatedSalones = [...salones, salon].sort((a, b) => a.hotelName.localeCompare(b.hotelName));
    setSalones(updatedSalones);
  };

  const updateSalon = (id: string, salonData: Partial<Salon>) => {
    setSalones(
      salones.map(salon =>
        salon.id === id
          ? { ...salon, ...salonData, updatedAt: new Date().toISOString() }
          : salon
      )
    );
  };

  const deleteSalon = (id: string) => {
    setSalones(salones.filter(salon => salon.id !== id));
  };

  const addCity = (stateName: string, cityName: string, coverImage?: string) => {
    const state = states.find(s => s.name === stateName);
    if (state && !cities.find(c => c.name === cityName && c.stateId === state.id)) {
      const newCity: City = {
        id: `${state.id}-${Date.now()}`,
        stateId: state.id,
        name: cityName,
        coverImage,
      };
      const updatedCities = [...cities, newCity].sort((a, b) => a.name.localeCompare(b.name));
      setCities(updatedCities);
    }
  };

  const deleteCity = (cityId: string) => {
    setCities(cities.filter(city => city.id !== cityId));
  };

  const addState = (stateName: string) => {
    if (!states.find(s => s.name === stateName)) {
      const gradients = [
        'from-purple-500 to-pink-500',
        'from-blue-500 to-cyan-500',
        'from-green-500 to-emerald-500',
        'from-orange-500 to-red-500',
      ];
      const newState: State = {
        id: `custom-${Date.now()}`,
        name: stateName,
        gradient: gradients[Math.floor(Math.random() * gradients.length)],
      };
      setStates([...states, newState]);
    }
  };

  const addEvent = (event: EventItem) => {
    const sorted = [...events, event].sort((a, b) => a.date.localeCompare(b.date));
    setEvents(sorted);
  };

  const updateEvent = (id: string, data: Partial<EventItem>) => {
    setEvents(prev =>
      prev.map(ev => (ev.id === id ? { ...ev, ...data, updatedAt: new Date().toISOString() } : ev))
    );
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(ev => ev.id !== id));
  };

  const exportData = (): BackupPayload => ({
    version: 1,
    states,
    cities,
    salones,
    events,
  });

  const importData = (data: BackupPayload) => {
    if (!data || typeof data !== 'object') return;
    if (!Array.isArray(data.salones) || !Array.isArray(data.cities) || !Array.isArray(data.states)) return;

    // Fusionar estados preservando imágenes locales si el backup no trae
    setStates(prevStates => {
      const isSameState = (a: State, b: State) => a.id === b.id || a.name.trim().toLowerCase() === b.name.trim().toLowerCase();

      const merged: State[] = [...prevStates];
      data.states.forEach((incoming) => {
        const idx = merged.findIndex((exist) => isSameState(exist, incoming));
        if (idx !== -1) {
          const existing = merged[idx];
          const backgroundImage = incoming.backgroundImage ?? existing.backgroundImage;
          merged[idx] = { ...existing, ...incoming, backgroundImage };
        } else {
          merged.push(incoming);
        }
      });

      // Quitar duplicados por id/name
      return merged.filter((state, idx, arr) =>
        arr.findIndex((s) => isSameState(s, state)) === idx
      ).sort((a, b) => a.name.localeCompare(b.name));
    });

    // Fusionar ciudades evitando duplicados y preservando portada local si falta en backup
    setCities(prevCities => {
      const existing = [...prevCities];
      const nuevas = data.cities;
      const isDuplicateCity = (a: City, b: City) =>
        a.name.trim().toLowerCase() === b.name.trim().toLowerCase() &&
        a.stateId === b.stateId;

      let fusionadas = [...existing];
      nuevas.forEach((nueva: City) => {
        const idx = fusionadas.findIndex((exist: City) => isDuplicateCity(exist, nueva));
        if (idx !== -1) {
          const existingCity = fusionadas[idx];
          const coverImage = nueva.coverImage ?? existingCity.coverImage;
          fusionadas[idx] = { ...existingCity, ...nueva, coverImage };
        } else {
          fusionadas.push(nueva);
        }
      });
      // Eliminar duplicados por name y stateId
      const unique = fusionadas.filter((city: City, idx: number, arr: City[]) =>
        arr.findIndex((c: City) => c.name.trim().toLowerCase() === city.name.trim().toLowerCase() && c.stateId === city.stateId) === idx
      );
      // Ordenar alfabéticamente
      return unique.sort((a: City, b: City) => a.name.localeCompare(b.name));
    });

    // Fusionar salones evitando duplicados por nombre, ciudad y estado
    setSalones(prevSalones => {
      const existing = [...prevSalones];
      const nuevos = data.salones;
      const isDuplicate = (a: Salon, b: Salon) =>
        a.hotelName.trim().toLowerCase() === b.hotelName.trim().toLowerCase() &&
        a.city.trim().toLowerCase() === b.city.trim().toLowerCase() &&
        a.state.trim().toLowerCase() === b.state.trim().toLowerCase();

      let fusionados = [...existing];
      nuevos.forEach((nuevo: Salon) => {
        const idx = fusionados.findIndex((exist: Salon) => isDuplicate(exist, nuevo));
        if (idx !== -1) {
          fusionados[idx] = { ...fusionados[idx], ...nuevo };
        } else {
          fusionados.push(nuevo);
        }
      });
      // Eliminar duplicados por hotelName, city y state
      const unique = fusionados.filter((salon: Salon, idx: number, arr: Salon[]) =>
        arr.findIndex((s: Salon) =>
          s.hotelName.trim().toLowerCase() === salon.hotelName.trim().toLowerCase() &&
          s.city.trim().toLowerCase() === salon.city.trim().toLowerCase() &&
          s.state.trim().toLowerCase() === salon.state.trim().toLowerCase()
        ) === idx
      );
      // Ordenar alfabéticamente
      return unique.sort((a: Salon, b: Salon) => a.hotelName.localeCompare(b.hotelName));
    });

    // Fusionar eventos evitando duplicados por fecha + estado + ciudad
    setEvents(prevEvents => {
      const isSameEvent = (a: EventItem, b: EventItem) =>
        a.date === b.date && a.stateId === b.stateId && a.city.trim().toLowerCase() === b.city.trim().toLowerCase();

      const merged = [...prevEvents];
      (data.events || []).forEach((incoming: EventItem) => {
        const idx = merged.findIndex((ev) => isSameEvent(ev, incoming));
        if (idx !== -1) {
          // preservar salons asignados si el backup no trae
          const existing = merged[idx];
          const courseSalons = incoming.courseSalons?.length ? incoming.courseSalons : existing.courseSalons;
          merged[idx] = { ...existing, ...incoming, courseSalons };
        } else {
          merged.push(incoming);
        }
      });

      return merged
        .filter((ev, idx, arr) => arr.findIndex(e => isSameEvent(e, ev)) === idx)
        .sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  return (
    <AppContext.Provider
      value={{
        states,
        cities,
        salones,
        events,
        selectedState,
        selectedCity,
        setSelectedState,
        setSelectedCity,
        addSalon,
        updateSalon,
        deleteSalon,
        getSalonsByCity,
        addCity,
        updateCityImage,
        deleteCity,
        addState,
        editStateImage,
        addEvent,
        updateEvent,
        deleteEvent,
        exportData,
        importData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
