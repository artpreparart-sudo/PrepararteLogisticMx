import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { CityCard } from '../components/CityCard';
import { useApp } from '../context/AppContext';

interface CitiesScreenProps {
  stateId: string;
  stateName: string;
  onBack: () => void;
  onCitySelect: (cityName: string) => void;
}

export const CitiesScreen = ({
  stateId,
  stateName,
  onBack,
  onCitySelect,
}: CitiesScreenProps) => {
  const { cities, addCity, updateCityImage, deleteCity } = useApp();
  const [editingCityId, setEditingCityId] = useState<string | null>(null);
  const [pendingCityImage, setPendingCityImage] = useState<string | undefined>(undefined);
  const [showAddCity, setShowAddCity] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const stateCities = cities.filter((city) => city.stateId === stateId);

  // Maneja el cambio de imagen en el modal de agregar ciudad
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCoverImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Agrega una nueva ciudad
  const handleAddCity = () => {
    if (!newCityName.trim()) return;
    addCity(stateName, newCityName.trim(), coverImage);
    setNewCityName('');
    setCoverImage(undefined);
    setSelectedFileName('');
    setShowAddCity(false);
  };



  return (
    <div className="space-y-8">
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-purple-400" />
          </button>
          <div>
            <h1 className="section-title text-4xl">Ciudades de {stateName}</h1>
            <p className="text-gray-400 mt-2">
              {stateCities.length} ciudades disponibles
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Ciudades */}
      {stateCities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stateCities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              onClick={() => onCitySelect(city.name)}
              onDelete={() => deleteCity(city.id)}
              onEditImage={() => setEditingCityId(city.id)}
            />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-gray-400">No hay ciudades registradas aún</p>
        </div>
      )}

      {/* Modal para editar imagen de ciudad */}
      {editingCityId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-white">Editar imagen de ciudad</h2>
            <input
              type="file"
              accept="image/*"
              className="input-field mb-4"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setPendingCityImage(ev.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
                e.target.value = '';
              }}
            />
            {/* Previsualización: si hay imagen nueva, mostrarla; si no, mostrar la actual */}
            {(pendingCityImage || (editingCityId && cities.find(c => c.id === editingCityId)?.coverImage)) && (
              <img
                src={pendingCityImage || cities.find(c => c.id === editingCityId)?.coverImage}
                alt="Previsualización"
                className="mb-4 max-h-32 rounded shadow"
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Si hay imagen nueva, guardar esa; si no, guardar la actual (para permitir guardar aunque no se haya cambiado)
                  const imageToSave = pendingCityImage ?? cities.find(c => c.id === editingCityId)?.coverImage ?? '';
                  updateCityImage(editingCityId ?? '', imageToSave);
                  setEditingCityId(null);
                  setPendingCityImage(undefined);
                }}
                className="btn-primary flex-1"
              >
                Guardar cambios
              </button>
              <button
                onClick={() => {
                  setEditingCityId(null);
                  setPendingCityImage(undefined);
                }}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón Agregar Ciudad */}
      <div className="pt-8 border-t border-dark-700">
        <button
          onClick={() => setShowAddCity(!showAddCity)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Agregar Ciudad
        </button>

        {/* Modal de Agregar Ciudad */}
        {showAddCity && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Agregar Nueva Ciudad
              </h2>
              <input
                type="text"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="Nombre de la ciudad"
                className="input-field mb-4"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCity()}
              />
              <label className="block text-white mb-2" htmlFor="city-bg-upload">Subir imagen de portada</label>
              <div className="mb-4">
                <label htmlFor="city-bg-upload" className="btn-secondary cursor-pointer inline-block">
                  Seleccionar archivo
                </label>
                <input
                  id="city-bg-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <span className="ml-2 text-white align-middle" id="city-bg-filename">{selectedFileName || 'Ningún archivo seleccionado'}</span>
              </div>
              {coverImage && (
                <img src={coverImage} alt="Portada" className="mb-4 max-h-32 rounded shadow" />
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleAddCity}
                  className="btn-primary flex-1"
                >
                  Agregar
                </button>
                <button
                  onClick={() => setShowAddCity(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
