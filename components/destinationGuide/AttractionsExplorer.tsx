// AttractionsExplorer.tsx
import React from 'react';

interface Props {
  destination: string;
}

const AttractionsExplorer: React.FC<Props> = ({ destination }) => {
  // Placeholder UI with glassmorphism card
  return (
    <section className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg space-y-4">
      <h2 className="text-xl font-bold text-white">Explore Attractions in {destination}</h2>
      <p className="text-gray-300">Famous attractions, hidden gems, and personalized filters will appear here.</p>
    </section>
  );
};

export default AttractionsExplorer;
