
import React, { useState, useEffect } from 'react';
import { TESTIMONIALS } from '../constants.tsx';

const Testimonials: React.FC = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-gray-950/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-indigo-400 font-bold tracking-widest uppercase mb-4">Community</h2>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Voices of Destinix</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Real stories from travelers who explored the world with our AI-guided intelligence.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Card */}
          <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 md:p-16">
            <div className="absolute top-10 right-10 opacity-10">
              <svg className="w-24 h-24 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V12C14.017 12.5523 13.5693 13 13.017 13H10.017C9.46472 13 9.017 12.5523 9.017 12V9C9.017 8.44772 9.46472 8 10.017 8H11.017V5H10.017C7.80786 5 6.017 6.79086 6.017 9V15C6.017 17.2091 7.80786 19 10.017 19H13.017C13.5693 19 14.017 19.4477 14.017 20V21H14.017Z" />
              </svg>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-2 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                {TESTIMONIALS[active].image ? (
                  <img src={TESTIMONIALS[active].image} alt={TESTIMONIALS[active].name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
                    {TESTIMONIALS[active].name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex justify-center md:justify-start space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < TESTIMONIALS[active].rating ? 'text-amber-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xl md:text-2xl text-gray-200 font-medium italic leading-relaxed mb-6">
                  "{TESTIMONIALS[active].content}"
                </p>
                <div>
                  <h4 className="text-white font-bold text-lg">{TESTIMONIALS[active].name}</h4>
                  <p className="text-indigo-400 text-sm font-medium">{TESTIMONIALS[active].role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center space-x-3 mt-10">
            {TESTIMONIALS.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setActive(idx)}
                className={`h-2 rounded-full transition-all ${active === idx ? 'w-8 bg-indigo-500' : 'w-2 bg-white/10'}`}
                aria-label={`Testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
