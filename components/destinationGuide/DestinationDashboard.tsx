// DestinationDashboard.tsx
import React from 'react';
import { Destination } from '../../types';

interface Props {
  data: Destination;
}

const DestinationDashboard: React.FC<Props> = ({ data }) => {
  return (
    <section className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg space-y-4">
      <h2 className="text-3xl font-extrabold text-white tracking-tight">{data.name}</h2>
      <p className="text-gray-300 text-lg leading-relaxed">{data.description}</p>
    </section>
  );
};

export default DestinationDashboard;
