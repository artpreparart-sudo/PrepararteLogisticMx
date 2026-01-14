import { useMemo, useRef, useState } from 'react';
import type { Salon } from './types';
import { AppProvider, useApp } from './context/AppContext';
import { StatesScreen } from './screens/StatesScreen';
import { CitiesScreen } from './screens/CitiesScreen';
import { SalonsScreen } from './screens/SalonsScreen';
import { RegisterSalonScreen } from './screens/RegisterSalonScreen';
import { SalonDetailScreen } from './screens/SalonDetailScreen';
import './index.css';

type Screen = 'states' | 'cities' | 'salons' | 'register' | 'detail';

function AppContent() {
  const { states, cities, salones, exportData, importData } = useApp();
  const [currentScreen, setCurrentScreen] = useState<Screen>('states');
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  type SearchResult =
    | { type: 'state'; id: string; title: string; subtitle: string }
    | { type: 'city'; id: string; title: string; subtitle: string; stateId: string }
    | { type: 'salon'; id: string; title: string; subtitle: string; city: string; state: string };

  const selectedState = states.find((s) => s.id === selectedStateId);

  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [] as SearchResult[];

    const stateMatches: SearchResult[] = states
      .filter((state) => state.name.toLowerCase().includes(q))
      .map((state) => ({
        type: 'state',
        id: state.id,
        title: state.name,
        subtitle: 'Estado',
      }));

    const cityMatches: SearchResult[] = cities
      .filter((city) => city.name.toLowerCase().includes(q))
      .map((city) => {
        const stateName = states.find((s) => s.id === city.stateId)?.name || 'Estado';
        return {
          type: 'city',
          id: city.id,
          title: city.name,
          subtitle: stateName,
          stateId: city.stateId,
        };
      });

    const salonMatches: SearchResult[] = salones
      .filter((salon) => {
        const fields = [
          salon.hotelName,
          salon.city,
          salon.state,
          salon.owner,
          salon.contact,
        ].map((f) => f.toLowerCase());
        return fields.some((field) => field.includes(q));
      })
      .map((salon) => ({
        type: 'salon',
        id: salon.id,
        title: salon.hotelName,
        subtitle: `${salon.city}, ${salon.state}`,
        city: salon.city,
        state: salon.state,
      }));

    return [...stateMatches, ...cityMatches, ...salonMatches].slice(0, 20);
  }, [cities, salones, searchTerm, states]);

  const handleStateSelect = (stateId: string) => {
    setSelectedStateId(stateId);
    setCurrentScreen('cities');
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setCurrentScreen('salons');
  };

  const handleBackToStates = () => {
    setCurrentScreen('states');
    setSelectedStateId('');
    setSelectedCity('');
  };

  const handleBackToCities = () => {
    setCurrentScreen('cities');
    setSelectedCity('');
  };

  const handleBackToSalons = () => {
    setCurrentScreen('salons');
    setSelectedSalon(null);
    setEditingSalon(null);
  };

  const handleAddSalon = () => {
    setEditingSalon(null);
    setCurrentScreen('register');
  };

  const handleSalonSelect = (salon: Salon) => {
    setSelectedSalon(salon);
    setCurrentScreen('detail');
  };

  const handleSearchSelect = (result: SearchResult) => {
    setSearchTerm('');
    setIsSearchFocused(false);

    if (result.type === 'state') {
      handleStateSelect(result.id);
      return;
    }

    if (result.type === 'city') {
      setSelectedStateId(result.stateId);
      setSelectedCity(result.title);
      setCurrentScreen('salons');
      return;
    }

    if (result.type === 'salon') {
      const stateMatch = states.find((s) => s.name === result.state);
      if (stateMatch) {
        setSelectedStateId(stateMatch.id);
      }
      setSelectedCity(result.city);
      const salon = salones.find((s) => s.id === result.id);
      if (salon) {
        handleSalonSelect(salon);
      } else {
        setCurrentScreen('salons');
      }
    }
  };

  const handleEditSalon = (salon: Salon) => {
    setEditingSalon(salon);
    setCurrentScreen('register');
  };

  const handleDeleteSalon = () => {
    handleBackToSalons();
  };

  const handleRegisterSuccess = () => {
    setEditingSalon(null);
    handleBackToSalons();
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agenda-preparate-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      importData(json);
      handleBackToStates();
      alert('Datos importados correctamente');
    } catch (err) {
      alert('No se pudo importar el archivo. Verifica que sea un JSON válido.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navbar */}
      <nav className="bg-dark-900/80 backdrop-blur-sm border-b border-dark-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleBackToStates}
              className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              <img
                src="/icons/Icono.logo.png"
                alt="Logo Prepárate México"
                className="h-8 w-8 object-contain drop-shadow"
                loading="lazy"
              />
              PREPARARTE MEXICO
            </button>

            {/* Buscador global */}
            <div className="flex-1 flex justify-center px-4">
              <div className="relative w-full max-w-xl">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchResults[0]) {
                      e.preventDefault();
                      handleSearchSelect(searchResults[0]);
                    }
                    if (e.key === 'Escape') {
                      setSearchTerm('');
                      setIsSearchFocused(false);
                    }
                  }}
                  placeholder="Buscar por estado, ciudad, salón o contacto"
                  className="w-full rounded-lg bg-dark-800 border border-dark-600 px-4 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none"
                />

                {isSearchFocused && searchTerm && (
                  <div className="absolute mt-2 w-full max-h-96 overflow-y-auto bg-dark-900 border border-dark-700 rounded-lg shadow-xl z-50">
                    {searchResults.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-400">Sin resultados</div>
                    ) : (
                      searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSearchSelect(result);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-dark-700 transition-colors"
                        >
                          <div className="text-xs uppercase tracking-wide text-purple-300 font-semibold">
                            {result.type === 'state' && 'Estado'}
                            {result.type === 'city' && 'Ciudad'}
                            {result.type === 'salon' && 'Salón'}
                          </div>
                          <div className="text-sm text-white leading-tight">{result.title}</div>
                          <div className="text-xs text-gray-400">{result.subtitle}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-gray-400 text-sm">
                {currentScreen === 'states' && 'Selecciona un estado'}
                {currentScreen === 'cities' && `${selectedState?.name}`}
                {currentScreen === 'salons' && `${selectedCity}, ${selectedState?.name}`}
                {currentScreen === 'register' && `Registrar salón en ${selectedCity}`}
                {currentScreen === 'detail' && selectedSalon?.hotelName}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="px-3 py-2 text-xs font-semibold bg-dark-800 text-gray-100 border border-dark-600 rounded-lg hover:bg-dark-700 transition"
                >
                  Exportar
                </button>
                <button
                  onClick={handleImportClick}
                  className="px-3 py-2 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition"
                >
                  Importar
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentScreen === 'states' && (
          <StatesScreen onStateSelect={handleStateSelect} />
        )}
        {currentScreen === 'cities' && selectedState && (
          <CitiesScreen
            stateId={selectedState.id}
            stateName={selectedState.name}
            onBack={handleBackToStates}
            onCitySelect={handleCitySelect}
          />
        )}
        {currentScreen === 'salons' && selectedState && (
          <SalonsScreen
            stateName={selectedState.name}
            cityName={selectedCity}
            onBack={handleBackToCities}
            onAddSalon={handleAddSalon}
            onSalonSelect={handleSalonSelect}
            onEditSalon={handleEditSalon}
          />
        )}
        {currentScreen === 'register' && selectedState && (
          <RegisterSalonScreen
            stateName={selectedState.name}
            cityName={selectedCity}
            existingSalon={editingSalon || undefined}
            onBack={handleBackToSalons}
            onSuccess={handleRegisterSuccess}
          />
        )}
        {currentScreen === 'detail' && selectedSalon && (
          <SalonDetailScreen
            salon={selectedSalon}
            onBack={handleBackToSalons}
            onEdit={() => handleEditSalon(selectedSalon)}
            onDelete={handleDeleteSalon}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-700 bg-dark-900 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>© 2025 AGENDA PREPARATE MEXICO. TODOS LOS DERECHOS RESERVADOS.</p>
          <p>FERCHOXR1</p>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
