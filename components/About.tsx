
import React from 'react';
import { useTranslation } from 'react-i18next';

const About: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-gray-950 min-h-screen">
      {/* Refined Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Enhanced Background with parallax feel */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?auto=format&fit=crop&q=80&w=2500" 
            alt="Premium Travel Vision" 
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          {/* Subtle multi-layer gradient for premium depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-gray-950"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">
          <div className="mb-8 inline-flex items-center space-x-2 px-5 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-xl animate-[fadeIn_0.8s_ease-out]">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">{t('about.philosophy')}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-10 leading-[1] animate-[slideUp_1s_ease-out]">
            {t('about.heroTitle1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-purple-300">
              {t('about.heroTitle2')}
            </span>
          </h1>

          <div className="max-w-3xl mx-auto">
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300/90 leading-relaxed mb-12 animate-[fadeIn_1.2s_ease-out_forwards] opacity-0">
              {t('about.heroSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-[fadeIn_1.4s_ease-out_forwards] opacity-0">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-950 overflow-hidden bg-gray-800">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Team" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm font-medium">{t('about.trustedBy')}</p>
            </div>
          </div>
        </div>

        {/* Bottom smooth fade transition */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-gray-950 to-transparent z-10"></div>
      </section>

      {/* Values Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 animate-[slideUp_1s_ease-out]">
            <div>
              <h2 className="text-indigo-400 font-black tracking-[0.2em] uppercase text-xs mb-4">{t('about.foundation')}</h2>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">{t('about.valuesTitle')}</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {[
                { title: t('about.valueCurationTitle'), desc: t('about.valueCurationDesc') },
                { title: t('about.valueArchitectTitle'), desc: t('about.valueArchitectDesc') },
                { title: t('about.valueConciergeTitle'), desc: t('about.valueConciergeDesc') },
                { title: t('about.valueEthicalTitle'), desc: t('about.valueEthicalDesc') }
              ].map((value, idx) => (
                <div key={idx} className="group">
                  <h3 className="text-white font-bold text-lg mb-3 flex items-center">
                    <span className="w-1 h-4 bg-indigo-500 rounded-full mr-3 group-hover:h-6 transition-all"></span>
                    {value.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-10 bg-indigo-600/10 blur-[100px] rounded-full"></div>
            <img 
              src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=1200" 
              alt="Luxury Travel Experience" 
              className="relative z-10 rounded-[60px] shadow-2xl border border-white/5 hover:scale-[1.01] transition-all duration-700"
            />
          </div>
        </div>
      </section>

      {/* Tech Section */}
      <section className="py-32 bg-black/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-indigo-400 font-bold tracking-widest uppercase mb-4 text-xs">{t('about.engine')}</h2>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">{t('about.engineTitle')}</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: t('about.techSyncTitle'), icon: '⚡', desc: t('about.techSyncDesc') },
              { title: t('about.techMoodTitle'), icon: '🧠', desc: t('about.techMoodDesc') },
              { title: t('about.techRiskTitle'), icon: '🛡️', desc: t('about.techRiskDesc') }
            ].map((card, i) => (
              <div key={i} className="group p-12 bg-white/5 border border-white/10 rounded-[48px] hover:bg-white/10 hover:border-indigo-500/50 transition-all hover:-translate-y-3 duration-500">
                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform origin-left">{card.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{card.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
