import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Car, Plane, Bike, Hotel, Sparkles, CheckCircle2, CreditCard } from 'lucide-react';
import { TravelPackage } from '../types';

interface BookingModalProps {
  pkg: TravelPackage;
  onClose: () => void;
  onConfirm: (options: any) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ pkg, onClose, onConfirm }) => {
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [step, setStep] = useState<'options' | 'confirm'>('options');

  const addons = [
    { id: 'flight', label: 'Premium Flight', price: 450, icon: <Plane className="w-5 h-5" />, desc: 'Business class upgrade with lounge access' },
    { id: 'car', label: 'Private Car', price: 120, icon: <Car className="w-5 h-5" />, desc: 'Chauffeur driven luxury sedan for all transfers' },
    { id: 'bike', label: 'Bike Rental', price: 45, icon: <Bike className="w-5 h-5" />, desc: 'Premium mountain bikes for local exploration' },
    { id: 'hotel', label: 'Suite Upgrade', price: 300, icon: <Hotel className="w-5 h-5" />, desc: 'Upgrade to Presidential Suite with ocean view' },
    { id: 'activities', label: 'VIP Activities', price: 200, icon: <Sparkles className="w-5 h-5" />, desc: 'Skip-the-line access to all major attractions' },
  ];

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    const addonTotal = addons
      .filter(a => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    return pkg.price + addonTotal;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-12">
          {step === 'options' ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-white mb-2">Customize Your Journey</h2>
                <p className="text-gray-400">Enhance your {pkg.destination} experience with our premium add-ons.</p>
              </div>

              <div className="space-y-4 mb-10 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {addons.map((addon) => (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`w-full flex items-center p-5 rounded-3xl border transition-all text-left group ${
                      selectedAddons.includes(addon.id)
                        ? 'bg-indigo-600/20 border-indigo-500/50 ring-1 ring-indigo-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl mr-4 transition-colors ${
                      selectedAddons.includes(addon.id) ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 group-hover:text-white'
                    }`}>
                      {addon.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-white">{addon.label}</h4>
                        <span className="text-indigo-400 font-bold">+${addon.price}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{addon.desc}</p>
                    </div>
                    <div className={`ml-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedAddons.includes(addon.id) ? 'bg-indigo-500 border-indigo-500' : 'border-white/10'
                    }`}>
                      {selectedAddons.includes(addon.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-white/10">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-1">Total Estimates</p>
                  <p className="text-3xl font-bold text-white">${calculateTotal()}</p>
                </div>
                <button 
                  onClick={() => setStep('confirm')}
                  className="bg-indigo-600 hover:bg-indigo-500 px-10 py-4 rounded-2xl text-white font-bold transition-all shadow-lg shadow-indigo-600/20"
                >
                  Continue to Booking
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <CreditCard className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white mb-4">Confirm Reservation</h2>
              <p className="text-gray-400 mb-10 max-w-md mx-auto">
                You are about to book the <span className="text-white font-bold">{pkg.title}</span> with {selectedAddons.length} premium add-ons.
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10 text-left">
                <div className="flex justify-between mb-4 pb-4 border-b border-white/5">
                  <span className="text-gray-400">Base Package</span>
                  <span className="text-white font-bold">${pkg.price}</span>
                </div>
                {selectedAddons.map(id => {
                  const addon = addons.find(a => a.id === id);
                  return (
                    <div key={id} className="flex justify-between mb-2 text-sm">
                      <span className="text-gray-500">{addon?.label}</span>
                      <span className="text-gray-300">${addon?.price}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between mt-4 pt-4 border-t border-white/10">
                  <span className="text-white font-bold">Total Amount</span>
                  <span className="text-2xl font-bold text-indigo-400">${calculateTotal()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setStep('options')}
                  className="flex-1 px-8 py-4 rounded-2xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 transition-all"
                >
                  Back to Options
                </button>
                <button 
                  onClick={() => onConfirm({ pkg, addons: selectedAddons, total: calculateTotal() })}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-2xl text-white font-bold transition-all shadow-lg shadow-indigo-600/20"
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BookingModal;
