
import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

export type DurationBucket = 'any' | 'short' | 'medium' | 'long';
export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'popularity';
export type TripType = 'Domestic' | 'International' | 'Luxury';

export const TRIP_TYPES: TripType[] = ['Domestic', 'International', 'Luxury'];

export const DURATION_OPTIONS: { id: DurationBucket; label: string }[] = [
  { id: 'any', label: 'Any Length' },
  { id: 'short', label: '1-3 Days' },
  { id: 'medium', label: '4-6 Days' },
  { id: 'long', label: '7+ Days' }
];

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'default', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'popularity', label: 'Most Popular' }
];

interface PackageFiltersProps {
  priceBounds: { min: number; max: number };
  minPrice: number;
  maxPrice: number;
  duration: DurationBucket;
  tripTypes: TripType[];
  sortBy: SortOption;
  resultCount: number;
  hasActiveFilters: boolean;
  onPriceChange: (min: number, max: number) => void;
  onDurationChange: (bucket: DurationBucket) => void;
  onTripTypeToggle: (type: TripType) => void;
  onSortChange: (sort: SortOption) => void;
  onReset: () => void;
}

const PackageFilters: React.FC<PackageFiltersProps> = ({
  priceBounds,
  minPrice,
  maxPrice,
  duration,
  tripTypes,
  sortBy,
  resultCount,
  hasActiveFilters,
  onPriceChange,
  onDurationChange,
  onTripTypeToggle,
  onSortChange,
  onReset
}) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxPrice);
    onPriceChange(value, maxPrice);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minPrice);
    onPriceChange(minPrice, value);
  };

  return (
    <div
      data-testid="package-filters"
      className="bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 mb-12 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-white font-bold">
          <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
          <span>Advanced Filters</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 hidden sm:inline">
            {resultCount} {resultCount === 1 ? 'package' : 'packages'} found
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              data-testid="reset-filters"
              className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-all"
            >
              <X className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Price Range */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Price Range
          </label>
          <div className="flex justify-between text-sm text-gray-300 mb-2 font-medium">
            <span>{minPrice.toLocaleString()}</span>
            <span>{maxPrice.toLocaleString()}</span>
          </div>
          <div className="relative h-6 flex items-center">
            <div className="absolute w-full h-1.5 bg-white/10 rounded-full" />
            <div
              className="absolute h-1.5 bg-indigo-500 rounded-full"
              style={{
                left: `${((minPrice - priceBounds.min) / Math.max(1, priceBounds.max - priceBounds.min)) * 100}%`,
                right: `${100 - ((maxPrice - priceBounds.min) / Math.max(1, priceBounds.max - priceBounds.min)) * 100}%`
              }}
            />
            <input
              type="range"
              aria-label="Minimum price"
              min={priceBounds.min}
              max={priceBounds.max}
              value={minPrice}
              onChange={handleMinChange}
              className="range-thumb absolute w-full appearance-none bg-transparent pointer-events-none"
            />
            <input
              type="range"
              aria-label="Maximum price"
              min={priceBounds.min}
              max={priceBounds.max}
              value={maxPrice}
              onChange={handleMaxChange}
              className="range-thumb absolute w-full appearance-none bg-transparent pointer-events-none"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Duration
          </label>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onDurationChange(opt.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  duration === opt.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:text-gray-200 hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trip Type + Sort */}
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Trip Type
            </label>
            <div className="flex flex-wrap gap-2">
              {TRIP_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onTripTypeToggle(type)}
                  aria-pressed={tripTypes.includes(type)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    tripTypes.includes(type)
                      ? 'bg-teal-500 text-gray-950 border-teal-500'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:text-gray-200 hover:border-white/20'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="package-sort" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Sort By
            </label>
            <select
              id="package-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full bg-white/5 border border-white/10 text-white text-sm font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id} className="bg-gray-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageFilters;
