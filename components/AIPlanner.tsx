import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Sparkles, MapPin, Calendar, Wallet, Clock, 
  ChevronDown, ChevronUp, Star, Coffee, Utensils, 
  Moon, Sun, Wind, Shield, Briefcase, Info, 
  Save, Download, Share2, RefreshCw, Map as MapIcon,
  Compass, Camera, Music, Heart, Zap, CheckCircle2,
  CloudSun, Thermometer, Plane, Car, Footprints, Bus,
  ShoppingBag, Hotel
} from 'lucide-react';
import { generateTripPlan } from '../services/geminiService';
import { TripPlan, TravelPackage, TravelInsurance, User, Page } from '../types';
import { MOCK_PACKAGES, INSURANCE_OPTIONS } from '../constants.tsx';

interface AIPlannerProps {
  user: User | null;
  onNavigate: (page: Page) => void;
  onSignInClick: () => void;
}

const TypingText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 10 }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

const AIPlanner: React.FC<AIPlannerProps> = ({ user, onNavigate, onSignInClick }) => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('Moderate');
  const [vibe, setVibe] = useState('Culture & Food');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handlePlan = async () => {
    if (!destination.trim()) {
      setNotification('Please enter a destination');
      return;
    }

    setLoading(true);
    setPlan(null);
    setIsSaved(false);

    try {
      const generated = await generateTripPlan(destination, days, budget, vibe);
      setPlan(generated);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error(error);
      setNotification('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = () => {
    if (!plan) return;
    
    if (!user) {
      setNotification('Please sign in to save your trip');
      onSignInClick();
      return;
    }

    // Mock saving to database
    const savedTripsStr = localStorage.getItem('destinix_saved_trips');
    const savedTrips = savedTripsStr ? JSON.parse(savedTripsStr) : [];
    savedTrips.push({ ...plan, savedAt: new Date().toISOString(), userId: user.id });
    localStorage.setItem('destinix_saved_trips', JSON.stringify(savedTrips));
    
    setIsSaved(true);
    setNotification('Trip saved to your profile successfully!');
  };

  const downloadPDF = async () => {
  if (!plan) return;

  try {
    setNotification("Generating Premium Travel PDF...");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const margin = 20;
    let y = 20;

    /* =========================
       HEADER
    ========================== */
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 40, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text("DESTINIX TRAVEL ITINERARY", pageWidth / 2, 18, { align: "center" });

    pdf.setFontSize(14);
    pdf.text(plan.destination.toUpperCase(), pageWidth / 2, 28, { align: "center" });

    y = 50;

    /* =========================
       DESTINATION IMAGE
    ========================== */
    if (destinationImages[0]) {
      const img = await fetch(destinationImages[0])
        .then(res => res.blob())
        .then(blob => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        }));

      pdf.addImage(img, "JPEG", margin, y, pageWidth - margin * 2, 60);
      y += 70;
    }

    /* =========================
       OVERVIEW SECTION
    ========================== */
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text("Trip Overview", margin, y);
    y += 8;

    pdf.setFontSize(11);
    const overviewLines = pdf.splitTextToSize(plan.destinationOverview, pageWidth - margin * 2);
    pdf.text(overviewLines, margin, y);
    y += overviewLines.length * 6 + 10;

    /* =========================
       BASIC INFO
    ========================== */
    pdf.setFontSize(13);
    pdf.text(`Duration: ${plan.duration} Days`, margin, y);
    y += 7;
    pdf.text(`Budget: ${plan.budget}`, margin, y);
    y += 7;
    pdf.text(`Best Time: ${plan.bestTimeToVisit}`, margin, y);
    y += 15;

    /* =========================
       DAY BY DAY
    ========================== */
    pdf.setFontSize(16);
    pdf.text("Day-by-Day Itinerary", margin, y);
    y += 10;

    for (const day of plan.itinerary) {
      if (y > 260) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFontSize(13);
      pdf.setTextColor(79, 70, 229);
      pdf.text(`Day ${day.day}: ${day.title}`, margin, y);
      y += 7;

      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);

      for (const activity of day.activities) {
        const lines = pdf.splitTextToSize(`• ${activity}`, pageWidth - margin * 2);
        pdf.text(lines, margin + 5, y);
        y += lines.length * 6;
      }

      y += 8;
    }

    /* =========================
       PACKING
    ========================== */
    if (y > 240) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(16);
    pdf.text("Packing Suggestions", margin, y);
    y += 8;

    pdf.setFontSize(11);
    for (const item of plan.packingSuggestions) {
      pdf.text(`• ${item}`, margin + 5, y);
      y += 6;
    }

    y += 10;

    /* =========================
       SAFETY
    ========================== */
    pdf.setFontSize(16);
    pdf.text("Safety & Travel Advice", margin, y);
    y += 8;

    pdf.setFontSize(11);
    const safetyLines = pdf.splitTextToSize(plan.safetyAdvice, pageWidth - margin * 2);
    pdf.text(safetyLines, margin, y);

    pdf.save(`Destinix_${plan.destination}_Premium_Itinerary.pdf`);

    setNotification("Premium itinerary downloaded successfully!");
  } catch (error) {
    console.error(error);
    setNotification("PDF generation failed.");
  }
};

  // Dynamic Images for Destination
  const destinationImages = useMemo(() => {
    const matchingPkg = MOCK_PACKAGES.find(p => p.destination.toLowerCase().includes(destination.toLowerCase()));
    if (matchingPkg && matchingPkg.gallery) {
      return matchingPkg.gallery;
    }
    const seed = destination.toLowerCase().replace(/\s+/g, '-');
    return [
      `https://picsum.photos/seed/${seed}-1/1200/800`,
      `https://picsum.photos/seed/${seed}-2/1200/800`,
      `https://picsum.photos/seed/${seed}-3/1200/800`,
      `https://picsum.photos/seed/${seed}-4/1200/800`,
    ];
  }, [destination, plan]);

  useEffect(() => {
    if (destinationImages.length > 0) {
      const timer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % destinationImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [destinationImages]);

  const getHighlightIcon = (type: string) => {
    switch (type) {
      case 'adventure': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'food': return <Utensils className="w-5 h-5 text-emerald-400" />;
      case 'culture': return <Compass className="w-5 h-5 text-indigo-400" />;
      case 'nature': return <Wind className="w-5 h-5 text-teal-400" />;
      case 'relaxation': return <Heart className="w-5 h-5 text-rose-400" />;
      default: return <Star className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getTransportIcon = (type?: string) => {
    switch (type) {
      case 'Walking': return <Footprints className="w-4 h-4" />;
      case 'Public Transport': return <Bus className="w-4 h-4" />;
      case 'Taxi': return <Car className="w-4 h-4" />;
      case 'Rental Car': return <Plane className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-32 pb-24 px-4 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10"></div>

      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-[slideDown_0.3s_ease-out]">
          <div className="bg-indigo-600/90 backdrop-blur-xl border border-white/20 px-8 py-4 rounded-full shadow-[0_0_30px_rgba(79,70,229,0.5)] text-white font-bold flex items-center space-x-3">
            <Info className="w-5 h-5 text-amber-400" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Next-Gen Intelligence</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-bold text-white mb-6"
          >
            Smart Trip <span className="text-indigo-400 italic">Architect</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            Experience the future of travel planning. Our AI crafts hyper-personalized, 
            luxury itineraries tailored to your unique vibe.
          </motion.p>
        </div>

        {/* Input Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:p-12 mb-24 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[80px] -z-10 group-hover:bg-indigo-600/10 transition-all duration-500"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-400" />
                  DESTINATION
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Kyoto, Amalfi Coast, Goa"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                    DAYS
                  </label>
                  <input 
                    type="number" 
                    min="1" max="14"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                    <Wallet className="w-4 h-4 mr-2 text-indigo-400" />
                    BUDGET
                  </label>
                  <select 
                    className="w-full bg-gray-900 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg appearance-none"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  >
                    <option value="Backpacker">Backpacker</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Ultra-Luxury">Ultra-Luxury</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                  <Compass className="w-4 h-4 mr-2 text-indigo-400" />
                  TRIP VIBE
                </label>
                <textarea 
                  placeholder="e.g. Hidden gems, local street food, photography spots, slow travel..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-[156px] transition-all text-lg resize-none"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handlePlan}
            disabled={loading}
            className="w-full mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-6 rounded-2xl transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] flex items-center justify-center space-x-3 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-xl">Architecting Your Journey...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 group-hover:scale-120 transition-transform" />
                <span className="text-xl">Generate Premium Itinerary</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {plan && (
            <motion.div 
              ref={resultsRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* Left Side: Visuals & Overview */}
              <div className="lg:col-span-5 space-y-8">
                {/* Image Slider */}
                <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl group">
                  <AnimatePresence mode="wait">
                    {destinationImages[currentImageIndex] ? (
                      <motion.img
                        key={currentImageIndex}
                        src={destinationImages[currentImageIndex]}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 1 }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.onerror = null; // prevent infinite loop
                          img.src =
                            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 animate-pulse flex items-center justify-center text-gray-500 text-sm">
                        Loading image...
                      </div>
                    )}
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-8 left-8 right-8">
                    <h2 className="text-4xl font-serif font-bold text-white mb-2">{plan.destination}</h2>
                    <div className="flex items-center space-x-4 text-white/80 text-sm">
                      <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {plan.duration} Days</span>
                      <span className="flex items-center"><Wallet className="w-4 h-4 mr-1" /> {plan.budget}</span>
                    </div>
                  </div>

                  {/* Thumbnail Navigation */}
                  <div className="absolute bottom-8 right-8 flex space-x-2">
                    {destinationImages.map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-6' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Overview Card */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Info className="w-5 h-5 mr-2 text-indigo-400" />
                    Trip Overview
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-6 italic">
                    <TypingText text={plan.destinationOverview} />
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Best Time</span>
                      <span className="text-white font-bold text-sm">{plan.bestTimeToVisit}</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Estimated Budget</span>
                      <span className="text-white font-bold text-sm">{plan.estimatedBudget}</span>
                    </div>
                  </div>

                  {plan.hotelSuggestion && (
                    <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 flex items-start">
                      <Hotel className="w-5 h-5 text-indigo-400 mr-3 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Stay Recommendation</span>
                        <span className="text-white font-bold text-sm">{plan.hotelSuggestion}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Weather & Map Preview */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[32px] p-6 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Weather</span>
                      <span className="text-2xl font-bold text-white">{plan.weather.temp}</span>
                      <span className="text-xs text-indigo-300 block">{plan.weather.condition}</span>
                    </div>
                    <CloudSun className="w-10 h-10 text-indigo-400" />
                  </div>
                  <div 
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plan.destination)}`, '_blank')}
                    className="bg-purple-500/10 border border-purple-500/20 rounded-[32px] p-6 flex items-center justify-between cursor-pointer hover:bg-purple-500/20 transition-all"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">Map View</span>
                      <span className="text-sm font-bold text-white">Interactive Map</span>
                    </div>
                    <MapIcon className="w-10 h-10 text-purple-400" />
                  </div>
                </div>

                {/* Budget Breakdown */}
                <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-indigo-400" />
                    Budget Breakdown
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(plan.budgetBreakdown).map(([key, val]) => (
                      <div key={key}>
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                          <span className="text-gray-400">{key}</span>
                          <span className="text-white">{val}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${val}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Itinerary & Details */}
              <div className="lg:col-span-7 space-y-8" ref={pdfRef}>
                {/* Highlights Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(plan.highlights).map(([key, val]) => (
                    <div key={key} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center group hover:bg-white/10 transition-all">
                      <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform">
                        {getHighlightIcon(key)}
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{key}</span>
                      <span className="text-[10px] text-white font-medium">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Day-wise Itinerary Accordion */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-indigo-400" />
                    Day-by-Day Journey
                  </h3>
                  {plan.itinerary.map((day) => (
                    <div 
                      key={day.day}
                      className={`bg-white/5 border transition-all duration-300 rounded-[32px] overflow-hidden ${expandedDay === day.day ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : 'border-white/10'}`}
                    >
                      <button 
                        onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                        className="w-full px-8 py-6 flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl transition-all ${expandedDay === day.day ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                            {day.day}
                          </div>
                          <div className="text-left">
                            <h4 className={`font-bold transition-colors ${expandedDay === day.day ? 'text-white text-xl' : 'text-gray-400'}`}>
                              {day.title}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center">
                                {getTransportIcon(day.transportation)}
                                <span className="ml-1">{day.transportation}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        {expandedDay === day.day ? <ChevronUp className="text-indigo-400" /> : <ChevronDown className="text-gray-600 group-hover:text-gray-400" />}
                      </button>

                      <AnimatePresence>
                        {expandedDay === day.day && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-8 pb-8"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                              <div className="space-y-6">
                                <div>
                                  <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center">
                                    <Sparkles className="w-3 h-3 mr-2" />
                                    Daily Activities
                                  </h5>
                                  <ul className="space-y-3">
                                    {day.activities.map((act, i) => (
                                      <li key={i} className="flex items-start text-gray-300 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-indigo-500 mr-3 mt-0.5 shrink-0" />
                                        {act}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              <div className="space-y-6">
                                <div>
                                  <h5 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center">
                                    <Star className="w-3 h-3 mr-2" />
                                    Expert Tips
                                  </h5>
                                  <div className="space-y-3">
                                    {day.recommendations.map((rec, i) => (
                                      <div key={i} className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-2xl italic text-xs text-gray-400">
                                        "{rec}"
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {day.shops && day.shops.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center">
                                      <ShoppingBag className="w-3 h-3 mr-2" />
                                      Shopping Stops
                                    </h5>
                                    <ul className="space-y-2">
                                      {day.shops.map((shop, i) => (
                                        <li key={i} className="text-gray-300 text-sm flex items-center">
                                          <div className="w-1 h-1 bg-amber-500 rounded-full mr-2"></div>
                                          {shop}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Travel Tips & Safety */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-indigo-400" />
                      Packing List
                    </h3>
                    <ul className="grid grid-cols-1 gap-3">
                      {plan.packingSuggestions.map((item, i) => (
                        <li key={i} className="flex items-center text-gray-400 text-sm">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-emerald-400" />
                      Safety & Advice
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                      {plan.safetyAdvice}
                    </p>
                    <div className="space-y-2">
                      {plan.travelTips.slice(0, 3).map((tip, i) => (
                        <div key={i} className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-2" />
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-6 pt-12 border-t border-white/5">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handleSaveTrip}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-2xl transition-all flex items-center shadow-lg shadow-indigo-600/20"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      Save Trip
                    </button>
                    <button 
                      onClick={downloadPDF}
                      className="bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-2xl border border-white/10 transition-all flex items-center"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download PDF
                    </button>
                  </div>
                  {!isSaved && (
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={handlePlan}
                        className="text-gray-400 hover:text-white font-bold flex items-center space-x-2 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIPlanner;
