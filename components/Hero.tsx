
import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants.tsx';

interface HeroProps {
  onSearch: (dest: string, filters: any) => void;
}

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000',
    title: 'The Future of Adventure',
    subtitle: 'Luxury Travel Reimagined'
  },
  {
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000',
    title: 'Pristine Coastal Escapes',
    subtitle: 'Discover Hidden Paradises'
  },
  {
    image: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&q=80&w=2000',
    title: 'Cultural Immersion',
    subtitle: 'Ancient Traditions, Modern Comfort'
  }
];

const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const [destination, setDestination] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchClick = () => {
    onSearch(destination, {});
  };

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slider */}
      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src={slide.image} 
            alt="Travel Background" 
            className={`w-full h-full object-cover transition-transform duration-[10000ms] ${
              index === currentSlide ? 'scale-110' : 'scale-100'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-gray-950"></div>
        </div>
      ))}

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto mt-20">
        <h2 className="text-indigo-400 font-bold tracking-widest uppercase mb-4 animate-[fadeIn_1s_ease-out]">
          {slides[currentSlide].subtitle}
        </h2>
        <h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-6 leading-tight animate-[slideUp_1.2s_ease-out]">
          {slides[currentSlide].title.split(' ')[0]} <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{slides[currentSlide].title.split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto animate-[slideUp_1.4s_ease-out]">
          AI-powered planning for your next legendary journey.
        </p>

        {/* Minimalist AI Search Bar */}
        <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-3xl border border-white/20 p-2 rounded-[40px] shadow-2xl flex items-stretch animate-[slideUp_1.6s_ease-out] group transition-all duration-300">
          
          {/* Destination Only */}
          <div className="flex-1 flex items-center px-8 py-4">
            <svg className="w-5 h-5 text-indigo-400 mr-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Where would you like to go?" 
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-gray-400 w-full text-lg font-medium appearance-none"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
            />
          </div>

          {/* Search Button */}
          <button 
            onClick={handleSearchClick}
            className="m-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all text-white font-bold px-10 rounded-[32px] shrink-0"
          >
            Explore Now
          </button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
};

export default Hero;
