
import React from 'react';
import { Page } from '../types';

interface CTASectionProps {
  onNavigate: (page: Page) => void;
  onRegisterClick: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onNavigate, onRegisterClick }) => {
  return (
    <section className="py-24 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-[#0088cc] rounded-[40px] md:rounded-[60px] p-12 md:p-24 text-center shadow-2xl">
          {/* Background Illustration / Eagle Effect */}
          <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&q=80&w=1500" 
              alt="Eagle Illustration" 
              className="w-full h-full object-cover mix-blend-overlay"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0088cc]/80 via-transparent to-[#0088cc]/80 pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto animate-[fadeIn_1s_ease-out]">
            <h2 className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
              READY TO START<br />YOUR NEXT ADVENTURE?
            </h2>
            <p className="text-white/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Join 50,000+ travelers who trust Destinix for their dream vacations. Intelligent planning, curated luxury, and global support.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => onNavigate(Page.Packages)}
                className="w-full sm:w-auto bg-white text-[#0088cc] px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl"
              >
                Explore Packages
              </button>
              <button 
                onClick={() => onNavigate(Page.Planner)}
                className="w-full sm:w-auto bg-white/10 text-white border-2 border-white/20 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-md"
              >
                Plan with AI
              </button>
              <button 
                onClick={onRegisterClick}
                className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
