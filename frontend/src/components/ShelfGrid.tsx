import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shelf } from '../api/client';

interface ShelfGridProps {
  shelves: Shelf[];
  highlightShelfId?: string;
  onSelectShelf?: (shelfId: string) => void;
  interactive?: boolean;
}

type ShelfVariant = 'normal' | 'half' | 'quarter' | 'sixth';

export const ShelfGrid: React.FC<ShelfGridProps> = ({
  shelves,
  highlightShelfId,
  onSelectShelf,
  interactive = true,
}) => {
  const navigate = useNavigate();

  const getShelf = (shelfId: string): Shelf | undefined => {
    return shelves.find((s) => s.id === shelfId);
  };

  const handleClick = (shelfId: string) => {
    if (!interactive) return;
    if (onSelectShelf) {
      onSelectShelf(shelfId);
    } else {
      navigate(`/shelves/${shelfId}`);
    }
  };

  const renderShelfButton = (shelfId: string, variant: ShelfVariant) => {
    const shelf = getShelf(shelfId);
    const isHighlighted = highlightShelfId === shelfId;
    const itemCount = shelf?.item_count ?? 0;
    const availableCount = shelf?.available_count ?? 0;

    let paddingClass = 'p-2 sm:p-2.5';
    let titleClass = 'text-sm sm:text-base font-extrabold tracking-wider';
    let badgeText = itemCount > 0 ? `${itemCount}個 (${availableCount}可)` : '空';
    let badgeClass = 'text-[11px] px-1.5 py-0.5';

    if (variant === 'half') {
      paddingClass = 'p-1 sm:p-1.5';
      titleClass = 'text-xs sm:text-sm font-bold tracking-tight';
      badgeText = itemCount > 0 ? `${itemCount}個` : '空';
      badgeClass = 'text-[10px] sm:text-[11px] px-1 py-0.2';
    } else if (variant === 'quarter') {
      paddingClass = 'p-1';
      titleClass = 'text-[11px] sm:text-xs font-bold leading-tight';
      badgeText = itemCount > 0 ? `${itemCount}個` : '空';
      badgeClass = 'text-[9px] sm:text-[10px] px-1 py-0.2';
    } else if (variant === 'sixth') {
      paddingClass = 'p-0.5 sm:p-1';
      titleClass = 'text-[10px] sm:text-[11px] font-bold leading-none';
      badgeText = itemCount > 0 ? `${itemCount}個` : '-';
      badgeClass = 'text-[8px] sm:text-[9px] px-0.5 py-0.2';
    }

    return (
      <button
        key={shelfId}
        type="button"
        onClick={() => handleClick(shelfId)}
        disabled={!interactive}
        title={`${shelfId}${shelf?.name ? `: ${shelf.name}` : ''} (${itemCount}点)`}
        className={`w-full h-full relative flex flex-col items-center justify-center rounded-xl transition-all duration-150 ${paddingClass} ${
          isHighlighted
            ? 'bg-indigo-600 text-white ring-2 sm:ring-4 ring-indigo-300 shadow-md scale-[1.02] font-bold z-10'
            : interactive
            ? 'bg-white hover:bg-indigo-50/70 hover:border-indigo-400 border border-slate-200 text-slate-800 shadow-xs hover:shadow-sm'
            : 'bg-white border border-slate-200 text-slate-700'
        }`}
      >
        <span
          className={`truncate max-w-full ${titleClass} ${
            isHighlighted ? 'text-white' : 'text-slate-800'
          }`}
        >
          {isHighlighted ? `[ ${shelfId} ]` : shelfId}
        </span>

        <div className="mt-0.5 flex items-center justify-center max-w-full">
          {itemCount > 0 ? (
            <span
              className={`rounded font-medium truncate ${badgeClass} ${
                isHighlighted
                  ? 'bg-white/25 text-white'
                  : availableCount > 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {badgeText}
            </span>
          ) : (
            <span
              className={`font-normal ${badgeClass} ${
                isHighlighted ? 'text-indigo-200' : 'text-slate-400'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="w-full bg-slate-100 p-3 sm:p-4 rounded-2xl border-2 border-slate-300 shadow-sm">
      <div className="sm:hidden text-[11px] text-slate-500 mb-1.5 flex items-center justify-end gap-1">
        <span>⇄ 左右スクロールで全体を表示</span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-[620px] sm:min-w-0 space-y-2.5 sm:space-y-3">
          {/* Row A: A-1 ~ A-5, Col 6 は上段が空、下段に A-6-1 (左) と A-6-2 (右) (B-3-1, B-3-2 と同サイズ) */}
          <div className="grid grid-cols-6 gap-2 sm:gap-2.5 min-h-[110px] sm:min-h-[125px]">
            {renderShelfButton('A-1', 'normal')}
            {renderShelfButton('A-2', 'normal')}
            {renderShelfButton('A-3', 'normal')}
            {renderShelfButton('A-4', 'normal')}
            {renderShelfButton('A-5', 'normal')}
            <div className="grid grid-cols-2 grid-rows-2 gap-1 sm:gap-1.5 h-full">
              <div className="col-span-2" aria-hidden="true" />
              {renderShelfButton('A-6-1', 'quarter')}
              {renderShelfButton('A-6-2', 'quarter')}
            </div>
          </div>

          {/* Row B: B-1, B-2, Col 3 (B-3-1~4 2x2), Col 4 (B-4-1~4 2x2), B-5, B-6 */}
          <div className="grid grid-cols-6 gap-2 sm:gap-2.5 min-h-[110px] sm:min-h-[125px]">
            {renderShelfButton('B-1', 'normal')}
            {renderShelfButton('B-2', 'normal')}
            <div className="grid grid-cols-2 grid-rows-2 gap-1 sm:gap-1.5 h-full">
              {renderShelfButton('B-3-1', 'quarter')}
              {renderShelfButton('B-3-2', 'quarter')}
              {renderShelfButton('B-3-3', 'quarter')}
              {renderShelfButton('B-3-4', 'quarter')}
            </div>
            <div className="grid grid-cols-2 grid-rows-2 gap-1 sm:gap-1.5 h-full">
              {renderShelfButton('B-4-1', 'quarter')}
              {renderShelfButton('B-4-2', 'quarter')}
              {renderShelfButton('B-4-3', 'quarter')}
              {renderShelfButton('B-4-4', 'quarter')}
            </div>
            {renderShelfButton('B-5', 'normal')}
            {renderShelfButton('B-6', 'normal')}
          </div>

          {/* Row C: C-1 ~ C-5, Col 6 は C-6-1 ~ C-6-6 (3x2) */}
          <div className="grid grid-cols-6 gap-2 sm:gap-2.5 min-h-[115px] sm:min-h-[130px]">
            {renderShelfButton('C-1', 'normal')}
            {renderShelfButton('C-2', 'normal')}
            {renderShelfButton('C-3', 'normal')}
            {renderShelfButton('C-4', 'normal')}
            {renderShelfButton('C-5', 'normal')}
            <div className="grid grid-cols-2 grid-rows-3 gap-1 sm:gap-1.5 h-full">
              {renderShelfButton('C-6-1', 'sixth')}
              {renderShelfButton('C-6-2', 'sixth')}
              {renderShelfButton('C-6-3', 'sixth')}
              {renderShelfButton('C-6-4', 'sixth')}
              {renderShelfButton('C-6-5', 'sixth')}
              {renderShelfButton('C-6-6', 'sixth')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
