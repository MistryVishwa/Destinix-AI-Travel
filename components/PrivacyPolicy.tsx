import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-gray-950 text-white min-h-screen pt-24">

      {/* HERO SECTION */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80"
          alt="Privacy Policy"
          className="absolute w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-4"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            {t('privacyPolicy.title')}
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            {t('privacyPolicy.subtitle')}
          </p>
        </motion.div>
      </div>

      {/* CONTENT SECTION */}
      <div className="max-w-5xl mx-auto px-6 py-20 space-y-14">

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('privacyPolicy.section1Title')}</h2>
          <p className="text-gray-400 leading-relaxed">
            {t('privacyPolicy.section1Body')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('privacyPolicy.section2Title')}</h2>
          <p className="text-gray-400 leading-relaxed">
            {t('privacyPolicy.section2Body')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('privacyPolicy.section3Title')}</h2>
          <p className="text-gray-400 leading-relaxed">
            {t('privacyPolicy.section3Body')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('privacyPolicy.section4Title')}</h2>
          <p className="text-gray-400 leading-relaxed">
            {t('privacyPolicy.section4Body')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('privacyPolicy.section5Title')}</h2>
          <p className="text-gray-400 leading-relaxed">
            {t('privacyPolicy.section5Body')}
          </p>
        </section>

      </div>

    </div>
  );
};

export default PrivacyPolicy;