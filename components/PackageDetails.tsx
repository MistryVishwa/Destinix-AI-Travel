
import React, { useState, useRef, useEffect } from 'react';
import { TravelPackage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MapPin, Calendar, Wallet, Sparkles, ShieldCheck, Play, Info, CheckCircle2, Hotel, Utensils, Plane, Car, Camera, UserCheck, XCircle, Loader2, Check, X } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { useNavigate } from 'react-router-dom';

const DESTINATION_VIDEOS: Record<string, string[]> = {
  'goa': [
    'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-beach-with-palm-trees-1533-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-waves-crashing-on-the-shore-of-a-beach-1538-large.mp4'
  ],
  'manali': [
    'https://assets.mixkit.co/videos/preview/mixkit-snowy-mountain-peaks-under-a-blue-sky-41551-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-forest-covered-in-snow-41552-large.mp4'
  ],
  'dubai': [
    'https://assets.mixkit.co/videos/preview/mixkit-city-skyline-at-night-with-many-lights-4432-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-driving-through-the-streets-of-a-modern-city-at-night-4435-large.mp4'
  ],
  'paris': [
    'https://assets.mixkit.co/videos/preview/mixkit-eiffel-tower-in-paris-at-sunset-4433-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-view-of-the-arc-de-triomphe-in-paris-4434-large.mp4'
  ],
  'kashmir': [
    'https://assets.mixkit.co/videos/preview/mixkit-mountain-landscape-with-a-lake-in-the-foreground-41553-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-snow-covered-mountains-under-a-clear-sky-41554-large.mp4'
  ],
  'default': [
    'https://assets.mixkit.co/videos/preview/mixkit-traveler-walking-on-a-pathway-in-the-middle-of-nature-27061-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-person-walking-on-a-wooden-bridge-in-the-forest-27062-large.mp4'
  ]
};

const normalizeDestination = (name: string) => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

const VideoHero: React.FC<{ destination: string; title: string; type: string; rating: number; fallbackImage: string | null }> = ({ destination, title, type, rating, fallbackImage }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(true);

  return (
    <div className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden bg-gray-900">
      <img 
        src={fallbackImage || `https://loremflickr.com/1200/800/${encodeURIComponent(destination)},travel/all`}
        alt={title}
        className="w-full h-full object-cover opacity-40"
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.src = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80";
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent z-10" />
      <div className="absolute inset-0 z-20 flex flex-col justify-end pb-12 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="mb-6">
          <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-400 flex items-center border border-white/5 w-fit">
            <span className="mr-1 text-amber-300">★</span>
            {rating?.toFixed(1)}
          </div>
        </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight max-w-4xl">{title}</h1>
        </div>
      </div>
    </div>
  );
};

interface PackageDetailsProps {
  pkg: TravelPackage;
  onBack: () => void;
  isSaved?: boolean;
  onToggleSave?: (pkg: TravelPackage) => void;
  onBook?: (pkg: TravelPackage) => void;
  onRequireAuth?: () => void;  
}
const PackageDetails: React.FC<PackageDetailsProps> = ({
  pkg,
  onBack,
  isSaved,
  onToggleSave,
  onBook,
  onRequireAuth
}) => {

const [images, setImages] = useState<string[]>([]);
const [activeImg, setActiveImg] = useState<string | null>(pkg.image || (Array.isArray(pkg.gallery) && pkg.gallery.length > 0 ? pkg.gallery[0] : null));
const [loadingImages, setLoadingImages] = useState(false);

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const buildSearchQuery = (pkg: TravelPackage) => {
  const title = pkg.title.toLowerCase();

  if (title.includes("rajasthan desert") || title.includes("desert safari")) {
    return "Rajasthan Thar Desert sand dunes camel safari sunset";
  }

  if (title.includes("jaipur") && title.includes("jodhpur") && title.includes("udaipur")) {
    return "Jaipur Amber Fort Jodhpur Mehrangarh Fort Udaipur City Palace Rajasthan";
  }

  if (title.includes("rajasthan family")) {
    return "Rajasthan forts palaces culture traditional architecture";
  }

  if (title.includes("munnar")) {
    return "Munnar tea gardens hills Kerala honeymoon misty mountains";
  }

  if (title.includes("kashmir")) {
    return "Kashmir Dal Lake snow mountains valley landscape";
  }

  if (title.includes("bali")) {
    return "Bali tropical beach temple island sunset Indonesia";
  }

  if (title.includes("rome")) {
    return "Rome Colosseum Vatican ancient architecture Italy";
  }

  if (title.includes("goa honeymoon")) {
    return "Goa romantic beach sunset couple luxury resort";
  }

  if (title.includes("goa family")) {
    return "Goa beach family vacation water activities";
  }

  if (title.includes("goa luxury")) {
    return "Goa luxury beach resort infinity pool";
  }

  if (title.includes("goa beach")) {
    return "Goa beach coastline aerial view";
  }

  return `${pkg.destination} famous landmark travel tourism landscape`;
};
useEffect(() => {
  const fetchImages = async () => {
    try {
      setLoadingImages(true);

      const query = buildSearchQuery(pkg);

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        }
      );

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setLoadingImages(false);
        return;
      }

      const imageList = data.results.map((img: any) => img.urls.regular);

      setImages(imageList);
      setActiveImg(imageList[0]);
      setLoadingImages(false);

    } catch (error) {
      console.error("Image fetch failed:", error);
      setLoadingImages(false);
    }
  };

  fetchImages();
}, [pkg.title]);

  /* =============================== */

  const [openDay, setOpenDay] = useState<number | null>(1);
  const navigate = useNavigate();
  const encodedDestination = encodeURIComponent(pkg.destination);
  const googleMapLink = `https://www.google.com/maps/search/?api=1&query=${encodedDestination}`;
  const googleMapEmbed = `https://www.google.com/maps?q=${encodedDestination}&output=embed`;

  const inclusionIcons: Record<string, any> = {
    'Hotel': <Hotel className="w-4 h-4" />,
    'Meals': <Utensils className="w-4 h-4" />,
    'Flight': <Plane className="w-4 h-4" />,
    'Transfer': <Car className="w-4 h-4" />,
    'Sightseeing': <Camera className="w-4 h-4" />,
    'Guide': <UserCheck className="w-4 h-4" />,
    'Activities': <Sparkles className="w-4 h-4" />
  };

  const detailedInclusions = [
    { label: 'Hotel Accommodation', value: '4-Star / 5-Star Premium Stay', icon: 'Hotel' },
    { label: 'Meals Included', value: 'Daily Breakfast & Dinner', icon: 'Meals' },
    { label: 'Airport Transfers', value: 'Private AC Vehicle', icon: 'Transfer' },
    { label: 'Local Transport', value: 'Dedicated Sightseeing Cab', icon: 'Transfer' },
    { label: 'Sightseeing', value: 'All Major Points Covered', icon: 'Sightseeing' },
    { label: 'Professional Guide', value: 'Government Approved Guide', icon: 'Guide' },
    { label: 'Adventure Activities', value: pkg.type === 'Adventure' ? 'Included as per Itinerary' : 'Optional Add-on', icon: 'Activities' }
  ];

  const priceBreakdown = {
    base: Math.round(pkg.price * 0.85),
    taxes: Math.round(pkg.price * 0.10),
    service: Math.round(pkg.price * 0.05),
  };

  return (
    <div className="bg-gray-950 min-h-screen">

      <VideoHero 
        destination={pkg.destination} 
        title={pkg.title} 
        type={pkg.type} 
        rating={pkg.rating} 
        fallbackImage={activeImg}
      />

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-30">

        {/* Breadcrumb / Back */}
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={() => navigate('/packages')}
            className="flex items-center text-gray-400 hover:text-white transition-colors group bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Explorations
          </button>
          
          {onToggleSave && (
            <button 
              onClick={() => onToggleSave(pkg)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all border backdrop-blur-md ${
                isSaved 
                ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-red-500/50 hover:text-red-400'
              }`}
            >
              <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{isSaved ? 'Saved' : 'Save Package'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">

            {/* ===============================
                ✅ CLEAN GALLERY SECTION
               =============================== */}

            <section>
              <div className="h-[400px] md:h-[500px] w-full rounded-[40px] overflow-hidden shadow-2xl border border-white/10 bg-gray-900 group">
                {activeImg ? (
                  <img 
                    src={activeImg}
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 animate-pulse" />
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-4 mt-6">
                  {images.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(img)}
                      className={`h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                        activeImg === img
                          ? "border-indigo-500 scale-105 shadow-lg shadow-indigo-500/20"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Rest of your code remains EXACTLY same */}

            {/* Description Section */}
            <section className="bg-white/5 p-8 md:p-12 rounded-[40px] border border-white/10">
              <h2 className="text-3xl font-serif font-bold text-white mb-6">About this journey</h2>
              <p className="text-xl text-gray-400 leading-relaxed mb-10">{pkg.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Duration</p>
                    <p className="text-lg text-white font-bold">{pkg.duration}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Starting Price</p>
                    <p className="text-lg text-white font-bold">{formatCurrency(pkg.price, pkg.currency)}</p>
                  </div>
                </div>
              </div>
              {/* Full Width Location Map */}
              <div 
                onClick={() => window.open(googleMapLink, '_blank')}
                className="mt-6 cursor-pointer p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-indigo-500/50 transition-all group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      Location
                    </p>
                    <p className="text-lg text-white font-bold">
                      {pkg.destination}
                    </p>
                  </div>
                </div>

                <div className="w-full h-72 rounded-2xl overflow-hidden border border-white/10">
                  <iframe
                    src={googleMapEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="pointer-events-none"
                  />
                </div>
              </div>
            </section>

            {/* Itinerary Section */}
            {pkg.itineraryDetails && (
              <section>
                <h2 className="text-3xl font-serif font-bold text-white mb-8">Detailed Itinerary</h2>
                <div className="space-y-4">
                  {pkg.itineraryDetails.map((day) => (
                    <div key={day.day} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                      <button 
                        onClick={() => setOpenDay(openDay === day.day ? null : day.day)}
                        className="w-full p-8 flex items-center justify-between text-left hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold mr-6 shrink-0 shadow-lg shadow-indigo-600/20">
                            {day.day}
                          </div>
                          <h4 className="text-xl font-bold text-white">{day.title}</h4>
                        </div>
                        <ChevronDown className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${openDay === day.day ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {openDay === day.day && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-8 pt-0 border-t border-white/5 text-gray-400 leading-relaxed text-lg">
                              {day.content}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              {/* Trip Overview Card */}
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[40px] p-8 shadow-2xl backdrop-blur-xl">
                <h3 className="text-white font-bold text-xl mb-8 flex items-center">
                  <Info className="w-5 h-5 mr-3 text-indigo-400" />
                  Trip Overview
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/5">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Destination</p>
                      <p className="text-base text-white font-bold">{pkg.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/5">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Best Season</p>
                      <p className="text-base text-white font-bold">Oct - March</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-purple-400 border border-white/5">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Travel Type</p>
                      <p className="text-base text-white font-bold">{pkg.type}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-10 border-t border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const user = localStorage.getItem("user");

                      if (user) {
                        onBook?.(pkg);
                      } else {
                        sessionStorage.setItem("pendingBookingId", pkg.id.toString());
                        onRequireAuth?.();
                      }
                    }}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-5 rounded-2xl text-white font-bold text-lg"
                  >
                    Secure Your Trip
                  </motion.button>
                </div>
              </div>

              {/* Price Breakdown Card */}
              <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-600/20 transition-all" />
                <h4 className="text-white font-bold mb-8 flex items-center text-lg">
                  <Wallet className="w-5 h-5 mr-3 text-emerald-400" />
                  Price Breakdown
                </h4>
                <div className="space-y-5 mb-10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Base Price</span>
                    <span className="text-white font-bold">{formatCurrency(priceBreakdown.base, pkg.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Taxes & Fees</span>
                    <span className="text-white font-bold">{formatCurrency(priceBreakdown.taxes, pkg.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Service Charge</span>
                    <span className="text-white font-bold">{formatCurrency(priceBreakdown.service, pkg.currency)}</span>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Amount</p>
                      <p className="text-xs text-emerald-400 font-medium">All-Inclusive</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white leading-none">{formatCurrency(pkg.price, pkg.currency)}</p>
                      {pkg.currency !== 'INR' && (
                        <p className="text-[10px] text-indigo-400 font-bold mt-2">
                          (₹{Math.round(pkg.price * 83.2).toLocaleString()} approx.)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                  Best price guaranteed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Structured What's Included Section - Full Width Below Grid */}
        <section className="mt-20 bg-white/5 p-8 md:p-12 rounded-[40px] border border-white/10 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h4 className="text-white font-bold flex items-center text-2xl">
              <CheckCircle2 className="w-8 h-8 mr-4 text-teal-400" />
              What's Included in This Package
            </h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {detailedInclusions.map((item, i) => (
              <div key={i} className="flex items-center space-x-4 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-teal-500/30 hover:bg-teal-500/5 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-110 transition-transform">
                  {inclusionIcons[item.icon]}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">{item.label}</p>
                  <p className="text-base text-gray-200 font-bold">{item.value}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <Check className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          {/* What's Not Included Section */}
          <div className="pt-12 border-t border-white/10">
            <h4 className="text-white font-bold mb-8 flex items-center text-xl">
              <XCircle className="w-6 h-6 mr-4 text-red-400" />
              What's Not Included
            </h4>
            <div className="bg-red-500/5 border border-red-500/10 rounded-[32px] p-8">
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-12">
                {[
                  'Personal Expenses & Shopping',
                  'Extra Adventure Activities (Pay Separately)',
                  'Optional Upgrades & Extra Rides',
                  'Travel Insurance (Unless specified)',
                  'Anything not mentioned in inclusions',
                  'Tips & Gratuities'
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-400 text-sm">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mr-4 shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PackageDetails;