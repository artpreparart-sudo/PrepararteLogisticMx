import { ChevronRight, Edit2 } from 'lucide-react';

import type { State } from '../types';

interface StateCardProps {
  state: State;
  onClick: () => void;
  onEditImage?: () => void;
}

export const StateCard = ({ state, onClick, onEditImage }: StateCardProps) => {
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Evita el click si se hace en el botón de editar
    if ((e.target as HTMLElement).closest('button')) return;
    onClick();
  };
  return (
    <div className="card card-hover group overflow-hidden state-card-bg relative" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {state.backgroundImage && (
        <>
          <img
            src={state.backgroundImage}
            alt="Fondo"
            className="absolute inset-0 w-full h-full object-cover rounded-xl z-0"
          />
        </>
      )}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${state.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300 z-0`}
        />
      <div className="relative p-6 flex flex-col justify-between h-full z-10">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-black mb-2">{state.name}</h3>
            <p className="text-sm text-gray-800">Haz clic para ver ciudades</p>
          </div>
          {typeof onEditImage === 'function' && (
            <button
              className="bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 transition-opacity ml-2"
              title="Editar imagen de fondo"
              onClick={onEditImage}
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex justify-end mt-2">
          <ChevronRight className="w-6 h-6 text-purple-400 group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </div>
  );
};
