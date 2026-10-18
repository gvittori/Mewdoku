import React from 'react';
import { CatBreed } from '../types';
import { CAT_BREEDS } from '../utils/levels';
import { Lock, Check, Sparkles } from 'lucide-react';

interface WardrobeModalProps {
  fishTreats: number;
  unlockedBreeds: string[];
  equippedBreed: string;
  onUnlockBreed: (breed: CatBreed) => void;
  onEquipBreed: (breedId: string) => void;
  onClose: () => void;
}

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  fishTreats,
  unlockedBreeds,
  equippedBreed,
  onUnlockBreed,
  onEquipBreed,
  onClose,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 overflow-x-hidden box-border">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-amber-900 tracking-tight">Cat Wardrobe & Breeds</h1>
          <p className="text-amber-700 text-sm mt-0.5">Collect fish treats to unlock adorable feline companions!</p>
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-100 border border-amber-200 rounded-2xl text-amber-900 font-bold text-sm shadow-xs shrink-0">
          <span>🐟</span>
          <span>{fishTreats}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CAT_BREEDS.map((breed) => {
          const isUnlocked = unlockedBreeds.includes(breed.id);
          const isEquipped = equippedBreed === breed.id;
          const canAfford = fishTreats >= breed.cost;

          return (
            <div
              key={breed.id}
              className={`bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between transition-all ${
                isEquipped ? 'border-amber-500 ring-2 ring-amber-400/30 bg-amber-50/40' : 'border-amber-200/80'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner relative shrink-0">
                  <span>{breed.icon}</span>
                  {breed.accessory && (
                    <span className="absolute -top-1 -right-1 text-sm">{breed.accessory}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 text-base">{breed.name}</h3>
                  <p className="text-xs text-amber-600 mt-0.5">
                    {isUnlocked ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Unlocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span>🐟</span> {breed.cost} Treats
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                {isEquipped ? (
                  <span className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs">
                    Equipped
                  </span>
                ) : isUnlocked ? (
                  <button
                    onClick={() => onEquipBreed(breed.id)}
                    className="px-4 py-2 bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    Equip
                  </button>
                ) : (
                  <button
                    onClick={() => onUnlockBreed(breed)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      canAfford
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    Unlock
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
