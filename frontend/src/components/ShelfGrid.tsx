import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shelf } from '../api/client';

interface ShelfGridProps {
  shelves: Shelf[];
  highlightShelfId?: string;
  onSelectShelf?: (shelfId: string) => void;
  interactive?: boolean;
}

export const ShelfGrid: React.FC<ShelfGridProps> = ({
  shelves,
  highlightShelfId,
  onSelectShelf,
  interactive = true,
}) => {
  const navigate = useNavigate();

  const rows = ['A', 'B', 'C'];
  const cols = [1, 2, 3];

  const getShelf = (row: string, col: number): Shelf | undefined => {
    const id = `${row}-${col}`;
    return shelves.find((s) => s.id === id);
  };

  const handleClick = (shelfId: string) => {
    if (!interactive) return;
    if (onSelectShelf) {
      onSelectShelf(shelfId);
    } else {
      navigate(`/shelves/${shelfId}`);
    }
  };

  return (
    <div className="w-full bg-slate-100 p-3 sm:p-4 rounded-2xl border-2 border-slate-300 shadow-sm">
      <div className="grid grid-rows-3 gap-2.5 sm:gap-3">
        {rows.map((row) => (
          <div key={row} className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {cols.map((col) => {
              const shelfId = `${row}-${col}`;
              const shelf = getShelf(row, col);
              const isHighlighted = highlightShelfId === shelfId;
              const itemCount = shelf?.item_count ?? 0;
              const availableCount = shelf?.available_count ?? 0;

              return (
                <button
                  key={shelfId}
                  type="button"
                  onClick={() => handleClick(shelfId)}
                  disabled={!interactive}
                  className={`relative flex flex-col items-center justify-center min-h-[85px] sm:min-h-[105px] p-2 rounded-xl transition-all duration-150 ${
                    isHighlighted
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-300 shadow-lg scale-[1.02] font-bold'
                      : interactive
                      ? 'bg-white hover:bg-indigo-50/70 hover:border-indigo-400 border border-slate-200 text-slate-800 shadow-sm hover:shadow'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  {/* Shelf Label */}
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-base sm:text-lg tracking-wider font-extrabold ${
                        isHighlighted ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {isHighlighted ? `[ ${shelfId} ]` : shelfId}
                    </span>
                  </div>

                  {/* Item counts indicator */}
                  <div className="mt-1 flex items-center gap-1.5 text-xs">
                    {itemCount > 0 ? (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                          isHighlighted
                            ? 'bg-white/25 text-white'
                            : availableCount > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {itemCount}個 ({availableCount}貸出可)
                      </span>
                    ) : (
                      <span
                        className={`text-[11px] ${
                          isHighlighted ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        空
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

