
import React, { useRef } from 'react';

interface HighlightItem {
  icon?: string;
  text: string;
}

interface HighlightsCarouselProps {
  items: HighlightItem[] | string[];
  title?: string;
  subtitle?: string;
  variant?: 'large' | 'small';
}

const HighlightsCarousel: React.FC<HighlightsCarouselProps> = ({ items, title, subtitle, variant = 'large' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const getIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('food') || t.includes('meal') || t.includes('dinner')) return '🍽️';
    if (t.includes('hotel') || t.includes('stay') || t.includes('resort')) return '🏨';
    if (t.includes('fly') || t.includes('flight') || t.includes('air')) return '✈️';
    if (t.includes('snow') || t.includes('ski') || t.includes('winter')) return '❄️';
    if (t.includes('water') || t.includes('beach') || t.includes('ocean')) return '🌊';
    if (t.includes('city') || t.includes('tour') || t.includes('walk')) return '🏙️';
    if (t.includes('nature') || t.includes('forest') || t.includes('trek')) return '🌲';
    if (t.includes('luxury') || t.includes('premium') || t.includes('exclusive')) return '✨';
    if (t.includes('culture') || t.includes('temple') || t.includes('history')) return '🏛️';
    if (t.includes('safari') || t.includes('desert')) return '🐪';
    return '🌟';
  };

  return (
    <div className={`relative ${variant === 'large' ? 'py-12' : ''}`}>
      {(title || subtitle) && (
        <div className="mb-8 text-center md:text-left">
          {subtitle && <h2 className="text-indigo-400 font-bold tracking-widest uppercase mb-2 text-xs">{subtitle}</h2>}
          {title && <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">{title}</h1>}
        </div>
      )}

      <div className="group relative">
        {/* Navigation Arrows (Desktop Only) */}
        {variant === 'large' && (
          <>
            <button 
              onClick={() => scroll('left')}
              className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex hover:bg-indigo-600 border-indigo-500/50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={() => scroll('right')}
              className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex hover:bg-indigo-600 border-indigo-500/50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}

        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4"
        >
          {items.map((item, idx) => {
            const text = typeof item === 'string' ? item : item.text;
            const icon = typeof item === 'string' ? getIcon(text) : (item.icon || getIcon(text));

            return (
              <div 
                key={idx}
                className={`snap-start shrink-0 flex items-center bg-white/5 border border-white/10 rounded-2xl transition-all hover:border-indigo-500/30 hover:bg-white/10 
                  ${variant === 'large' ? 'p-6 min-w-[240px] md:min-w-[280px]' : 'p-3 min-w-[140px]'}`}
              >
                <div className={`mr-4 flex items-center justify-center rounded-xl bg-indigo-500/10 text-xl ${variant === 'large' ? 'w-12 h-12' : 'w-8 h-8 text-base'}`}>
                  {icon}
                </div>
                <div>
                  <h4 className={`font-bold text-white whitespace-nowrap ${variant === 'large' ? 'text-sm' : 'text-[10px]'}`}>
                    {text}
                  </h4>
                  {variant === 'large' && <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">Experience</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HighlightsCarousel;
