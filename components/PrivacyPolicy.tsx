import React from 'react';
import { motion } from 'motion/react';

const PrivacyPolicy: React.FC = () => {
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
            Privacy Policy
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            We respect your privacy and are committed to protecting your personal information.
          </p>
        </motion.div>
      </div>

      {/* CONTENT SECTION */}
      <div className="max-w-5xl mx-auto px-6 py-20 space-y-14">

        <section>
          <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
          <p className="text-gray-400 leading-relaxed">
            We collect information that you provide directly to us, including your name, 
            email address, travel preferences, booking details, and payment information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-400 leading-relaxed">
            Your data helps us personalize recommendations, process bookings, 
            provide customer support, and improve our AI-powered travel services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
          <p className="text-gray-400 leading-relaxed">
            We implement strong technical and organizational security measures 
            to protect your personal data against unauthorized access or misuse.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Third-Party Services</h2>
          <p className="text-gray-400 leading-relaxed">
            We may use trusted third-party services such as payment gateways 
            and analytics providers. These services operate under their own 
            privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
          <p className="text-gray-400 leading-relaxed">
            You have the right to access, update, or delete your personal data. 
            You may contact us anytime for privacy-related requests.
          </p>
        </section>

      </div>

    </div>
  );
};

export default PrivacyPolicy;