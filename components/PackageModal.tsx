
import React, { useState, useEffect } from 'react';
import { TravelPackage } from '../types';
import { formatCurrency } from '../utils/currency';

interface PackageModalProps {
  pkg: TravelPackage;
  onClose: () => void;
  onBook: (pkg: TravelPackage) => void;
}

const PackageModal: React.FC<PackageModalProps> = ({ pkg, onClose, onBook }) => {
  const [currentImg, setCurrentImg] = useState(0);
  const gallery = pkg.gallery || [
    pkg.image,
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800'
  ];

  // Prevent scroll on body when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-gray-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-[slideUp_0.4s_ease-out]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all border border-white/10 backdrop-blur-md"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Gallery Sidebar */}
        <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden bg-black shrink-0">
          {gallery[currentImg] ? (
            <img 
              src={gallery[currentImg]} 
              alt={pkg.title} 
              className="w-full h-full object-cover transition-all duration-700 animate-[fadeIn_0.5s_ease-out]" 
            />
          ) : (
            <div className="w-full h-full bg-gray-800 animate-pulse" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Thumbnails */}
          <div className="absolute bottom-6 left-6 right-6 flex gap-2 overflow-x-auto no-scrollbar">
            {gallery.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentImg(i)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${currentImg === i ? 'border-indigo-500 scale-105 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                {img ? (
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-800" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 no-scrollbar bg-gray-950/50">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">{pkg.type}</span>
              <span className="text-amber-400 text-sm font-bold flex items-center">★ {pkg.rating}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 leading-tight">{pkg.title}</h2>
            <p className="text-gray-400 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              {pkg.destination} • {pkg.duration}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-3xl">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Starting From</p>
              <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(pkg.price, pkg.currency, true)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-3xl">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Trip Length</p>
              <p className="text-2xl font-bold text-white tracking-tight">{pkg.duration}</p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 flex items-center">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
              Highlights & Inclusions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(pkg.highlights || pkg.inclusions || ['Luxury Accommodation', 'Private Transfers', 'Expert Guide', 'All Meals']).map((h, i) => (
                <div key={i} className="flex items-center text-gray-400 text-xs">
                  <svg className="w-4 h-4 mr-2 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  {h}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 flex items-center">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full mr-3"></span>
              Experience Overview
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 italic">
              "Discover the breathtaking soul of {pkg.destination}. From local secrets to iconic landmarks, our experts have curated the perfect balance of luxury and adventure."
            </p>
            {pkg.itineraryDetails ? (
               <div className="space-y-4">
                 {pkg.itineraryDetails.slice(0, 3).map(day => (
                   <div key={day.day} className="flex gap-4">
                     <div className="text-indigo-400 font-bold text-xs shrink-0">D{day.day}</div>
                     <div className="text-gray-300 text-xs font-medium">{day.title}</div>
                   </div>
                 ))}
                 <p className="text-gray-500 text-[10px] italic">+ {pkg.itineraryDetails.length - 3} more days of adventure</p>
               </div>
            ) : (
              <p className="text-gray-500 text-[10px] italic">Detailed hour-by-hour itinerary available upon booking.</p>
            )}
          </div>

          <div className="pt-6 sticky bottom-0 bg-gray-950/80 backdrop-blur-md pb-2">
            <button 
              onClick={() => onBook(pkg)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] py-5 rounded-2xl text-white font-bold transition-all hover:scale-[1.02] shadow-xl"
            >
              Secure This Journey Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageModal;
