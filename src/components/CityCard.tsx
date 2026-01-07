import { ChevronRight, Star, Trash2, Edit2 } from 'lucide-react';
import type { City } from '../types';
import { useApp } from '../context/AppContext';


interface CityCardProps {
  city: City;
  onClick: () => void;
  onEditImage?: () => void;
  onDelete?: () => void;
}



export const CityCard = ({ city, onClick, onEditImage, onDelete }: CityCardProps) => {
  const { salones } = useApp();
  const salonCount = salones.filter(s => s.city === city.name).length;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Evita el click si se hace en los botones de editar/eliminar
    if ((e.target as HTMLElement).closest('button')) return;
    onClick();
  };

  return (
    <div className="card card-hover group overflow-hidden h-44 flex flex-col p-0 relative" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {city.coverImage ? (
        <img
          src={city.coverImage}
          alt={city.name}
          className="w-full h-24 object-cover rounded-t"
        />
      ) : (
        <div className="w-full h-24 bg-gray-300 rounded-t flex items-center justify-center text-gray-500 text-xs">
          Sin imagen
        </div>
      )}
      <div className="relative p-4 h-full flex flex-col justify-between flex-1">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-white">{city.name}</h3>
          <div className="flex gap-2">
            {typeof onDelete === 'function' && (
              <button
                className="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-opacity"
                title="Eliminar ciudad"
                onClick={onDelete}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-2">{salonCount} salones registrados</p>
        <div className="flex justify-between items-center mt-2">
          {salonCount > 3 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4" />
              <span className="text-xs">Más usado</span>
            </div>
          )}
          <button
            onClick={onClick}
            className="ml-auto"
            title="Ver ciudad"
          >
            <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

