
import React from 'react';
import { motion } from 'motion/react';
import { TravelPackage } from '../types';
import { formatCurrency } from '../utils/currency';

interface PackageCardProps {
  pkg: TravelPackage;
  isAlertSet?: boolean;
  isSaved?: boolean;
  onToggleAlert?: (pkg: TravelPackage) => void;
  onToggleSave?: (pkg: TravelPackage) => void;
  onViewDetails?: (pkg: TravelPackage) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, isAlertSet, isSaved, onToggleAlert, onToggleSave, onViewDetails }) => {
  const [imgSrc, setImgSrc] = React.useState<string>(
    pkg.image && pkg.image.trim() !== "" 
      ? pkg.image 
      : `https://picsum.photos/seed/${pkg.destination}/800/600`
  );

  React.useEffect(() => {
  const buildQuery = () => {
    const title = pkg.title.toLowerCase();

    if (title.includes("rajasthan desert")) {
      return "Rajasthan Thar Desert sand dunes camel";
    }

    if (title.includes("jaipur") && title.includes("jodhpur")) {
      return "Jaipur Amber Fort Jodhpur Mehrangarh Fort Udaipur City Palace";
    }

    if (title.includes("rajasthan family")) {
      return "Rajasthan forts palaces culture";
    }

    if (title.includes("goa honeymoon")) {
      return "Goa romantic beach sunset couple";
    }

    if (title.includes("goa family")) {
      return "Goa beach family vacation";
    }

    if (title.includes("goa beach")) {
      return "Goa beach coastline aerial";
    }

    if (title.includes("munnar")) {
      return "Munnar tea gardens hills Kerala";
    }

    if (title.includes("kashmir")) {
      return "Kashmir Dal Lake snow mountains";
    }

    if (title.includes("rome")) {
      return "Rome Colosseum Vatican";
    }

    return pkg.destination;
  };

  const fetchImage = async () => {
    try {
      const query = buildQuery();

      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`
          }
        }
      );

      const data = await res.json();

      if (data.results && data.results.length > 0) {
        setImgSrc(data.results[0].urls.regular);
      }
    } catch (error) {
      console.error("Image fetch failed:", error);
    }
  };

  fetchImage();
}, [pkg.title]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const fallback = `https://picsum.photos/seed/${pkg.destination}-fallback/800/600`;
    if (e.currentTarget.src !== fallback) {
      e.currentTarget.src = fallback;
    }
  };

  return (
    <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] overflow-hidden hover:scale-[1.03] hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 shadow-xl flex flex-col h-full">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={pkg.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 animate-pulse" />
        )}
        
        {/* Type Badge */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-indigo-500/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
            {pkg.type}
          </div>
          <div className="bg-teal-500/90 backdrop-blur-md px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-white flex items-center">
            <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            Insurance Incl.
          </div>
        </div>

        {/* Floating Actions */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {onToggleSave && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(pkg);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                isSaved ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}

          {onToggleAlert && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleAlert(pkg);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                isAlertSet ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30' : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <svg className="w-4 h-4" fill={isAlertSet ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          )}
          <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-400 flex items-center border border-white/5">
            <span className="mr-1 text-amber-300">★</span> {pkg.rating.toFixed(1)}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">
          {pkg.duration}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
          {pkg.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">
          {pkg.description}
        </p>

        {/* Note: Highlights carousel removed as per user request */}
        
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">
                {formatCurrency(pkg.price, pkg.currency, true)}
              </span>
              <span className="text-gray-500 text-[10px] ml-1 font-medium">/ explorer</span>
            </div>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewDetails?.(pkg)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl text-sm font-bold text-white transition-all flex items-center justify-center group/btn shadow-lg shadow-indigo-600/20"
          >
            View Details
            <svg className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
