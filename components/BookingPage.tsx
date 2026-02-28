import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TravelPackage } from '../types';
import { formatCurrency, calculateInr } from '../utils/currency';
import { generateReceiptPDF } from '../utils/receipt';
import { jsPDF } from 'jspdf';
import InvoiceTemplate from "./InvoiceTemplate";

import { 
  Car, Plane, Bike, Hotel, Sparkles, 
  CheckCircle2, CreditCard, ShieldCheck, 
  ChevronLeft, Info, Wallet, MapPin, Calendar as CalendarIcon,
  ArrowRight, User, Mail, Phone, Home, Loader2, Bell
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface BookingPageProps {
  pkg: TravelPackage;
  onBack: () => void;
  onConfirm: (data: any) => void;
}

const BookingPage: React.FC<BookingPageProps> = ({ pkg, onBack, onConfirm }) => {
  if (!pkg) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Package not found</h2>
          <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300">Go Back</button>
        </div>
      </div>
    );
  }

  const [showFakeRazorpay, setShowFakeRazorpay] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const handleCardNumberChange = (value: string) => {
  // Remove all non-digits
  let digits = value.replace(/\D/g, '');

  // Limit to 16 digits
  if (digits.length > 16) {
    digits = digits.slice(0, 16);
  }

  // Add spacing every 4 digits
  const formatted = digits.replace(/(.{4})/g, '$1 ').trim();

  setCardNumber(formatted);
};
  const isExpiryValid = () => {
    if (!expiry || expiry.length !== 5) return false;

    const [monthStr, yearStr] = expiry.split('/');
    const month = parseInt(monthStr);
    const year = parseInt('20' + yearStr);

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const expiryDate = new Date(year, month);

    return expiryDate > now;
  };
  // ✅ ADD THIS BELOW
  const handleExpiryChange = (value: string) => {
    // Remove non-digits
    let digits = value.replace(/\D/g, '');

    // Limit to 4 digits (MMYY)
    if (digits.length > 4) digits = digits.slice(0, 4);

    // Validate month (first 2 digits)
    if (digits.length >= 2) {
      const month = parseInt(digits.slice(0, 2));
      if (month < 1 || month > 12) return;
    }

    // Auto format MM/YY
    if (digits.length >= 3) {
      digits = digits.slice(0, 2) + '/' + digits.slice(2);
    }

    setExpiry(digits);
  };
  const [numTravelers, setNumTravelers] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [flightDetails, setFlightDetails] = useState({
    departure: '',
    arrival: pkg.destination,
    departureDate: '',
    returnDate: '',
    class: 'Economy'
  });
  const [hotelDetails, setHotelDetails] = useState({
    hotelId: '',
    checkIn: '',
    checkOut: '',
    guests: 2
  });

  const [carDetails, setCarDetails] = useState({
    pickupDate: ''
  });

  const [bikeDetails, setBikeDetails] = useState({
    bikeId: '',
    duration: 1,
    startDate: ''
  });

  const [bikeTermsAccepted, setBikeTermsAccepted] = useState(false);

  const bikeOptions = [
    { id: 'b1', name: 'Royal Enfield Himalayan', type: 'Adventure', price: 45, image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=300&q=80' },
    { id: 'b2', name: 'Kawasaki Ninja 400', type: 'Sport', price: 65, image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=300&q=80' },
    { id: 'b3', name: 'Harley Davidson Iron 883', type: 'Cruiser', price: 85, image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=300&q=80' },
    { id: 'b4', name: 'KTM Duke 390', type: 'Street', price: 50, image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=300&q=80' },
    { id: 'b5', name: 'BMW G310 GS', type: 'Adventure', price: 55, image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=300&q=80' },
  ];

  const mockHotels = [
    { id: 'h1', name: 'Grand Palace Resort', rating: 4.8, price: Math.round(250 * 1.5) },
    { id: 'h2', name: 'Ocean View Suites', rating: 4.5, price: Math.round(180 * 1.5) },
    { id: 'h3', name: 'Mountain Retreat', rating: 4.7, price: Math.round(210 * 1.5) },
  ];

  const addons = [
    { id: 'flight', label: 'Flight Booking', price: Math.round(450 * 1.5), icon: <Plane className="w-5 h-5" />, desc: 'Business class upgrade with lounge access' },
    { id: 'car', label: 'Car Rental', price: Math.round(120 * 1.5), icon: <Car className="w-5 h-5" />, desc: 'Chauffeur driven luxury sedan for all transfers' },
    { id: 'bike', label: 'Bike Rental', price: Math.round(45 * 1.5), icon: <Bike className="w-5 h-5" />, desc: 'Premium mountain bikes for local exploration' },
    { id: 'hotel', label: 'Suite Upgrade', price: Math.round(300 * 1.5), icon: <Hotel className="w-5 h-5" />, desc: 'Upgrade to Presidential Suite with ocean view' },
    { id: 'activities', label: 'VIP Activities', price: Math.round(200 * 1.5), icon: <Sparkles className="w-5 h-5" />, desc: 'Skip-the-line access to all major attractions' },
  ];

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [showUserDetailsForm, setShowUserDetailsForm] = useState(false);
  const [isDetailsSaved, setIsDetailsSaved] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpError, setOtpError] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const bookingIdRef = useRef<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isInternational = useMemo(() => {
    return pkg.type === 'International' || pkg.currency !== 'INR';
  }, [pkg.type, pkg.currency]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });

  const [isDemo, setIsDemo] = useState(false);

  // Reset saved status when any detail changes to force re-validation
  useEffect(() => {
    setIsDetailsSaved(false);
  }, [userDetails, flightDetails, carDetails, bikeDetails, selectedVehicle, numTravelers, selectedAddons]);

  // Auto-select Flight for International packages
  useEffect(() => {
    if (isInternational && !selectedVehicle) {
      setSelectedVehicle('flight');
    }
  }, [isInternational, selectedVehicle]);

  const sendOtp = async () => {
    if (!userDetails.email) {
      showToast("Please enter email first", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userDetails.email)) {
      showToast("Enter valid email", "error");
      return;
    }

    try {
      setOtpError('');
      setIsOtpVerified(false);

      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userDetails.email })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOtpSent(true);
        setIsDemo(data.isDemo);
        showToast("Verification code sent!", "success");
      } else {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || "Failed to send OTP");
        showToast(errorMsg, "error");
      }
      } catch (err) {
      console.error(err);
      showToast("Server error sending OTP", "error");
    }
  };

  const verifyOtp = async () => {
    if (enteredOtp.length !== 6) {
      setOtpError("Please enter 6-digit OTP");
      return;
    }

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userDetails.email,
          otp: enteredOtp
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsOtpVerified(true);
        setOtpError('');
        showToast("Email verified successfully!", "success");
      } else {
        setOtpError(data.error || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Verification failed. Try again.");
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      // Check if script is already in document
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSaveDetails = async (e?: React.FormEvent): Promise<boolean> => {
    if (e) e.preventDefault();
    
    if (!selectedVehicle) {
      showToast("Please select a travel option!", "error");
      return false;
    }

    if (selectedVehicle === 'flight') {
      if (!flightDetails.departure || !flightDetails.departureDate) {
        showToast("Fill Up the Details Form Fisrt (Enter departure city & date!)", "error");
        return false;
      }
    } else if (selectedVehicle === 'car') {
      if (!carDetails.pickupDate) {
        showToast("Select a pickup date!", "error");
        return false;
      }
    } else if (selectedVehicle === 'bike') {
      if (!bikeTermsAccepted) {
        showToast("Accept rental terms!", "error");
        return false;
      }
      if (!bikeDetails.bikeId || !bikeDetails.startDate) {
        showToast("Select bike & start date!", "error");
        return false;
      }
    }

    if (!isOtpVerified || !userDetails.firstName || !userDetails.lastName || !userDetails.address || !userDetails.phone || !userDetails.city || !userDetails.zipCode) {
      showToast("Please fill all details!", "error");
      return false;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userDetails,
          packageId: pkg.id,
          packageTitle: pkg.title,
          packageImage: pkg.image || pkg.thumbnail || (Array.isArray(pkg.images) ? pkg.images[0] : null),
          totalAmount: pricing.total,
          currency: pkg.currency,
          flight: flightDetails,
          hotel: hotelDetails,
          addons: selectedAddons,
          pricing: pricing,
          numTravelers: numTravelers,
          selectedVehicle: selectedVehicle
        })
      });

      if (response.ok) {
        const data = await response.json();
        bookingIdRef.current = data.bookingId;
        setBookingId(data.bookingId);
        setIsDetailsSaved(true);
        showToast("Details saved successfully!", "success");
        return true;
      } else {
        showToast('Failed to save booking details. Please try again.', "error");
        return false;
      }
    } catch (error) {
      console.error('Error saving details:', error);
      showToast('An error occurred. Please try again.', "error");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    let saved = isDetailsSaved;
    if (!saved) {
      saved = await handleSaveDetails();
      if (!saved) return;
    }

    setShowFakeRazorpay(true);
  };

  const downloadReceipt = async () => {
  if (!paymentData) {
    showToast("No payment data found", "error");
    return;
  }

  try {
    const doc = await generateReceiptPDF(
      paymentData,
      pkg,
      userDetails,
      numTravelers,
      selectedVehicle,
      pricing
    );

    doc.save(`Destinix_Receipt_${paymentData.paymentId}.pdf`);

  } catch (error) {
    console.error("Receipt download failed:", error);
    showToast("Failed to download receipt", "error");
  }
};

  const pricing = useMemo(() => {
    const basePerPerson = Math.round(pkg.price * 0.85);
    const taxesPerPerson = Math.round(pkg.price * 0.10);
    const servicePerPerson = Math.round(pkg.price * 0.05);
    
    let vehicleCharge = selectedVehicle 
      ? (addons.find(a => a.id === selectedVehicle)?.price || 0)
      : 0;

    if (selectedVehicle === 'bike' && bikeDetails.bikeId) {
      const selectedBike = bikeOptions.find(b => b.id === bikeDetails.bikeId);
      if (selectedBike) {
        vehicleCharge = selectedBike.price * bikeDetails.duration;
      }
    }
      
    const otherAddonsTotal = addons
      .filter(a => selectedAddons.includes(a.id) && a.id !== 'flight' && a.id !== 'car' && a.id !== 'bike')
      .reduce((sum, a) => sum + a.price, 0);
      
    // Cabin class surcharges (only if flight is selected)
    const classSurcharges: Record<string, number> = {
      'Economy': 0,
      'Premium Economy': 150,
      'Business': 450,
      'First Class': 1000
    };
    const classSurcharge = (selectedVehicle === 'flight') ? (classSurcharges[flightDetails.class] || 0) : 0;

    const total = (pkg.price * numTravelers) + vehicleCharge + otherAddonsTotal + classSurcharge;
    
    return {
      base: basePerPerson * numTravelers,
      taxes: taxesPerPerson * numTravelers,
      service: servicePerPerson * numTravelers,
      vehicleCharge,
      otherAddonsTotal,
      classSurcharge,
      total
    };
  }, [pkg, selectedAddons, flightDetails.class, numTravelers, selectedVehicle, bikeDetails]);

  return (
    <div className="pt-20 pb-24 bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Back to Package
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Options */}
          <div className="lg:col-span-8 space-y-12">
            <section>
              <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 tracking-tight">Complete Your Booking</h1>
                <p className="text-gray-400 text-lg max-w-2xl">Review your journey details and select any premium add-ons to enhance your experience.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 mb-12">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-48 h-32 rounded-3xl overflow-hidden shrink-0">
                    {(() => {
                      const imageSrc =
                        pkg.image ||
                        pkg.thumbnail ||
                        pkg.coverImage ||
                        pkg.heroImage ||
                        (Array.isArray(pkg.images) ? pkg.images[0] : null) ||
                        (Array.isArray(pkg.gallery) ? pkg.gallery[0] : null);

                      // Fallback dynamic image based on destination using a reliable service
                      const fallbackImage = `https://loremflickr.com/600/400/${encodeURIComponent(
                        pkg.destination || 'travel'
                      )},landscape/all`;

                      const finalImage = imageSrc || fallbackImage;

                      return (
                        <img
                          src={finalImage}
                          alt={pkg.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // If even fallback fails, load a generic high-quality travel image
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                      );
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="bg-indigo-600/20 text-indigo-400 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">{pkg.type}</span>
                        <span className="text-amber-400 text-xs font-bold">★ {pkg.rating}</span>
                      </div>
                      <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl px-4 py-2">
                        <User className="w-4 h-4 text-gray-500 mr-2" />
                        <select 
                          value={numTravelers}
                          onChange={(e) => setNumTravelers(parseInt(e.target.value))}
                          className="bg-transparent text-white text-sm outline-none cursor-pointer"
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <option key={n} value={n} className="bg-gray-900">{n} {n === 1 ? 'Traveler' : 'Travelers'}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{pkg.title}</h2>
                    <p className="text-gray-400 text-sm line-clamp-2">{pkg.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Car className="w-5 h-5 mr-2 text-indigo-400" />
                  Select Your Travel Option
                </h3>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Mandatory Selection
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                {addons.filter(a => {
                  if (isInternational) return a.id === 'flight';
                  return ['flight', 'car', 'bike'].includes(a.id);
                }).map((addon) => (
                  <button
                    key={addon.id}
                    onClick={() => setSelectedVehicle(addon.id)}
                    className={`flex flex-col p-6 rounded-3xl border transition-all text-left group relative ${
                      selectedVehicle === addon.id
                        ? 'bg-indigo-600/20 border-indigo-500/50 ring-1 ring-indigo-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`p-4 rounded-2xl mb-4 w-fit transition-colors ${
                      selectedVehicle === addon.id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 group-hover:text-white'
                    }`}>
                      {addon.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-base mb-1">{addon.label}</h4>
                      <p className="text-indigo-400 font-bold text-sm mb-2">+{formatCurrency(addon.price, pkg.currency)}</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{addon.desc}</p>
                    </div>
                    {selectedVehicle === addon.id && (
                      <div className="absolute top-4 right-4 text-indigo-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {selectedVehicle && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  {/* Other Add-ons */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-indigo-400" />
                      Premium Add-ons (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addons.filter(a => !['flight', 'car', 'bike'].includes(a.id)).map((addon) => (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`flex items-center p-5 rounded-3xl border transition-all text-left group ${
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
                              <h4 className="font-bold text-white text-sm">{addon.label}</h4>
                              <span className="text-indigo-400 font-bold text-sm">+{formatCurrency(addon.price, pkg.currency)}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-relaxed">{addon.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Travel & Traveler Details Section */}
                  <div className="pt-12 border-t border-white/5">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      {selectedVehicle === 'flight' ? <Plane className="w-5 h-5 mr-2 text-indigo-400" /> : 
                       selectedVehicle === 'car' ? <Car className="w-5 h-5 mr-2 text-indigo-400" /> : 
                       <Bike className="w-5 h-5 mr-2 text-indigo-400" />}
                      {selectedVehicle.charAt(0).toUpperCase() + selectedVehicle.slice(1)} Customization & Traveler Details
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-8">
                      {/* Traveler Information (Common) */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <User className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-sm font-bold text-white uppercase tracking-widest">Traveler Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">First Name</label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input 
                                type="text" 
                                value={userDetails.firstName}
                                onChange={(e) => setUserDetails({...userDetails, firstName: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 outline-none transition-all"
                                placeholder="John"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Last Name</label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input 
                                type="text" 
                                value={userDetails.lastName}
                                onChange={(e) => setUserDetails({...userDetails, lastName: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 outline-none transition-all"
                                placeholder="Doe"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Email Address</label>
                          <div className="flex gap-3">
                            <div className="relative flex-1">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input 
                                type="email" 
                                disabled={isOtpVerified || otpSent}
                                value={userDetails.email}
                                onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                                className={`w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 outline-none transition-all ${isOtpVerified ? 'border-emerald-500/50' : ''}`}
                                placeholder="john@example.com"
                              />
                              {isOtpVerified && (
                                <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                              )}
                            </div>
                            {!isOtpVerified && (
                              <button
                                type="button"
                                onClick={otpSent ? () => { 
                                  setOtpSent(false); 
                                  setEnteredOtp(''); 
                                  setOtpError(''); 
                                } : sendOtp}
                                disabled={!userDetails.email}
                                className="px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white text-sm font-bold transition-all whitespace-nowrap"
                              >
                                {otpSent ? 'Change' : 'Send OTP'}
                              </button>
                            )}
                          </div>
                        </div>

                        {otpSent && !isOtpVerified && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 space-y-4"
                          >
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Verification Code</label>
                              <span className="text-[10px] text-gray-500 italic">
                                {`Sent to ${userDetails.email}`}
                              </span>
                            </div>
                            <div className="flex gap-3">
                              <input
                                type="text"
                                placeholder="6-digit code"
                                value={enteredOtp}
                                onChange={(e) => setEnteredOtp(e.target.value)}
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-center text-xl font-mono tracking-widest focus:border-indigo-500 outline-none transition-all"
                                maxLength={6}
                              />
                              <button
                                type="button"
                                onClick={verifyOtp}
                                className="px-8 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white text-sm font-bold transition-all"
                              >
                                Verify
                              </button>
                            </div>
                            <div className="flex justify-between items-center px-1">
                              <p className="text-xs text-gray-500 italic">Didn't receive code?</p>
                              <button 
                                type="button" 
                                onClick={sendOtp}
                                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                              >
                                Resend Code
                              </button>
                            </div>
                            {otpError && (
                              <p className="text-red-500 text-xs text-center font-medium">{otpError}</p>
                            )}
                          </motion.div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Phone Number</label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input 
                                type="tel" 
                                value={userDetails.phone}
                                onChange={(e) => {
                                  const value = e.target.value.trim();
                                  setUserDetails({ ...userDetails, phone: value });
                                  if (value === '') { setPhoneError(''); return; }
                                  const indianWithCode = /^\+91\d{10}$/;
                                  const indianWithoutCode = /^\d{10}$/;
                                  if (value.length >= 10) {
                                    if (!indianWithCode.test(value) && !indianWithoutCode.test(value)) {
                                      setPhoneError("Enter 10 digits or +91 followed by 10 digits");
                                    } else { setPhoneError(''); }
                                  } else { setPhoneError(''); }
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 outline-none transition-all"
                                placeholder="+91 98765 43210"
                              />
                            </div>
                            {phoneError && <p className="text-red-500 text-[10px] mt-1 ml-2">{phoneError}</p>}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">City</label>
                            <div className="relative">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input 
                                type="text" 
                                value={userDetails.city}
                                onChange={(e) => setUserDetails({...userDetails, city: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 outline-none transition-all"
                                placeholder="Mumbai"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Address</label>
                            <div className="relative">
                              <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input 
                                type="text"
                                value={userDetails.address}
                                onChange={(e) => setUserDetails({...userDetails, address: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 outline-none transition-all"
                                placeholder="Flat No, Street, Landmark..."
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Zip Code</label>
                            <input 
                              type="text" 
                              value={userDetails.zipCode}
                              onChange={(e) => setUserDetails({...userDetails, zipCode: e.target.value})}
                              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-indigo-500 outline-none transition-all"
                              placeholder="400001"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Vehicle Details */}
                      {selectedVehicle === 'flight' && (
                        <div className="pt-8 border-t border-white/5 space-y-8">
                          <div className="flex items-center space-x-2 mb-4">
                            <Plane className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Flight Customization</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Departure City</label>
                              <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                  type="text" 
                                  value={flightDetails.departure}
                                  onChange={(e) => setFlightDetails({...flightDetails, departure: e.target.value})}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 outline-none transition-all"
                                  placeholder="From where?"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Arrival City</label>
                              <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                  type="text" 
                                  value={flightDetails.arrival}
                                  onChange={(e) => setFlightDetails({...flightDetails, arrival: e.target.value})}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 outline-none transition-all"
                                  placeholder="Destination"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Departure Date</label>
                              <input 
                                type="date" 
                                value={flightDetails.departureDate}
                                onChange={(e) => setFlightDetails({...flightDetails, departureDate: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-indigo-500 outline-none transition-all [color-scheme:dark]"
                              />
                            </div>

                          </div>
                          <div className="space-y-4">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Cabin Class</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {[
                                { name: 'Economy', price: 0, desc: 'Standard seating' },
                                { name: 'Premium Economy', price: 150, desc: 'Extra legroom & snacks' },
                                { name: 'Business', price: 450, desc: 'Flat-bed & lounge' },
                                { name: 'First Class', price: 1000, desc: 'Ultimate luxury' }
                              ].map((cls) => (
                                <button
                                  key={cls.name}
                                  type="button"
                                  onClick={() => setFlightDetails({...flightDetails, class: cls.name})}
                                  className={`p-5 rounded-2xl border text-left transition-all group relative ${
                                    flightDetails.class === cls.name 
                                      ? 'bg-indigo-600/20 border-indigo-500/50 ring-1 ring-indigo-500/50' 
                                      : 'bg-black/40 border-white/10 hover:border-white/20'
                                  }`}
                                >
                                  <div className={`text-sm font-bold mb-1 transition-colors ${
                                    flightDetails.class === cls.name ? 'text-white' : 'text-gray-400 group-hover:text-white'
                                  }`}>
                                    {cls.name}
                                  </div>
                                  <p className="text-[10px] text-gray-500 mb-2">{cls.desc}</p>
                                  {cls.price > 0 && (
                                    <div className="text-[10px] text-indigo-400 font-bold">
                                      +{formatCurrency(cls.price, pkg.currency)}
                                    </div>
                                  )}
                                  {flightDetails.class === cls.name && (
                                    <div className="absolute top-4 right-4 text-indigo-500">
                                      <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedVehicle === 'car' && (
                        <div className="pt-8 border-t border-white/5 space-y-8">
                          <div className="flex items-center space-x-2 mb-4">
                            <Car className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Car Rental Details</h4>
                          </div>
                          <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Pickup Date</label>
                              <input 
                                type="date" 
                                value={carDetails.pickupDate}
                                onChange={(e) => setCarDetails({...carDetails, pickupDate: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-indigo-500 outline-none transition-all [color-scheme:dark]"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedVehicle === 'bike' && !bikeTermsAccepted && (
                        <div className="pt-8 border-t border-white/5 space-y-6">
                           <div className="flex items-center space-x-2 mb-4">
                            <Info className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Rental Terms & Conditions</h4>
                          </div>
                          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-gray-400 space-y-4 max-h-60 overflow-y-auto">
                            <p>1. The rider must be at least 21 years of age and hold a valid driving license.</p>
                            <p>2. A security deposit may be required at the time of pickup.</p>
                            <p>3. The vehicle must be returned with the same fuel level as provided.</p>
                            <p>4. Any damage to the vehicle during the rental period is the responsibility of the hirer.</p>
                            <p>5. Insurance covers third-party liability only unless premium protection is selected.</p>
                            <p>6. Late returns will incur additional hourly charges.</p>
                          </div>
                          <button
                            onClick={() => setBikeTermsAccepted(true)}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all"
                          >
                            I Agree to the Terms
                          </button>
                        </div>
                      )}

                      {selectedVehicle === 'bike' && bikeTermsAccepted && (
                        <div className="pt-8 border-t border-white/5 space-y-8">
                           <div className="flex items-center space-x-2 mb-4">
                            <Bike className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Select Your Bike</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {bikeOptions.map(bike => (
                              <button
                                key={bike.id}
                                onClick={() => setBikeDetails({...bikeDetails, bikeId: bike.id})}
                                className={`p-4 rounded-2xl border transition-all text-left group relative ${
                                  bikeDetails.bikeId === bike.id ? 'bg-indigo-600/20 border-indigo-500/50 ring-1 ring-indigo-500/50' : 'bg-black/40 border-white/10 hover:border-white/20'
                                }`}
                              >
                                <img src={bike.image} alt={bike.name} className="w-full h-32 object-cover rounded-xl mb-3" />
                                <div className="flex justify-between items-start mb-1">
                                  <h5 className="font-bold text-white text-sm">{bike.name}</h5>
                                  <span className="text-indigo-400 font-bold text-xs">+{formatCurrency(bike.price, pkg.currency)}/day</span>
                                </div>
                                <p className="text-[10px] text-gray-500">{bike.type}</p>
                                {bikeDetails.bikeId === bike.id && (
                                  <div className="absolute top-4 right-4 text-indigo-500">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Rental Start Date</label>
                              <input 
                                type="date" 
                                value={bikeDetails.startDate}
                                onChange={(e) => setBikeDetails({...bikeDetails, startDate: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-indigo-500 outline-none transition-all [color-scheme:dark]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Rental Duration (Days)</label>
                              <select 
                                value={bikeDetails.duration}
                                onChange={(e) => setBikeDetails({...bikeDetails, duration: parseInt(e.target.value)})}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-indigo-500 outline-none transition-all appearance-none"
                              >
                                {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} Days</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

              {/* Hotel Selection Section */}
              <div className="pt-12 border-t border-white/5">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Hotel className="w-5 h-5 mr-2 text-indigo-400" />
                  Hotel Selection (Optional If Wants Private Stay)
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockHotels.map((hotel) => (
                      <button
                        key={hotel.id}
                        onClick={() => setHotelDetails({...hotelDetails, hotelId: hotel.id})}
                        className={`flex items-center p-5 rounded-3xl border transition-all text-left group ${
                          hotelDetails.hotelId === hotel.id 
                            ? 'bg-indigo-600/20 border-indigo-500/50 ring-1 ring-indigo-500/50' 
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className={`p-3 rounded-2xl mr-4 transition-colors ${
                          hotelDetails.hotelId === hotel.id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 group-hover:text-white'
                        }`}>
                          <Hotel className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-white text-sm">{hotel.name}</h4>
                            <span className="text-indigo-400 font-bold text-sm">+{formatCurrency(hotel.price, pkg.currency)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-amber-400 text-[10px] font-bold">★ {hotel.rating}</span>
                            <span className="text-[10px] text-gray-500">Luxury Stay</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Check-in</label>
                        <input 
                          type="date" 
                          value={hotelDetails.checkIn}
                          onChange={(e) => setHotelDetails({...hotelDetails, checkIn: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-indigo-500 outline-none transition-all [color-scheme:dark]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Check-out</label>
                        <input 
                          type="date" 
                          value={hotelDetails.checkOut}
                          onChange={(e) => setHotelDetails({...hotelDetails, checkOut: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-indigo-500 outline-none transition-all [color-scheme:dark]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Guests</label>
                        <select 
                          value={hotelDetails.guests}
                          onChange={(e) => setHotelDetails({...hotelDetails, guests: parseInt(e.target.value)})}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-indigo-500 outline-none transition-all appearance-none"
                        >
                          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guests</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </section>

            {selectedVehicle && (
              <section className="pt-12 border-t border-white/5">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-emerald-400" />
                  Travel Protection
                </h3>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] p-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mr-4">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Destinix Elite Care</h4>
                      <p className="text-xs text-gray-500">Comprehensive medical & trip cancellation coverage included.</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm uppercase tracking-widest">Included</span>
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl -mr-16 -mt-16" />
                
                <h3 className="text-xl font-bold text-white mb-8 flex items-center">
                  <Wallet className="w-5 h-5 mr-3 text-indigo-400" />
                  Price Summary
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Base Package (x{numTravelers})</span>
                    <span className="text-white font-bold">{formatCurrency(pricing.base, pkg.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Taxes & Fees</span>
                    <span className="text-white font-bold">{formatCurrency(pricing.taxes, pkg.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Service Charge</span>
                    <span className="text-white font-bold">{formatCurrency(pricing.service, pkg.currency)}</span>
                  </div>

                  {selectedVehicle && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Vehicle Charge ({addons.find(a => a.id === selectedVehicle)?.label || "Vehicle"})</span>
                      <span className="text-white font-bold">+{formatCurrency(pricing.vehicleCharge, pkg.currency)}</span>
                    </div>
                  )}

                  {pricing.classSurcharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cabin Upgrade ({flightDetails.class})</span>
                      <span className="text-white font-bold">+{formatCurrency(pricing.classSurcharge, pkg.currency)}</span>
                    </div>
                  )}
                  
                  {selectedAddons.length > 0 && (
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Add-ons</p>
                      {selectedAddons.map(id => {
                        const addon = addons.find(a => a.id === id);
                        return (
                          <div key={id} className="flex justify-between text-xs">
                            <span className="text-gray-500">{addon?.label}</span>
                            <span className="text-gray-300">+{formatCurrency(addon?.price || 0, pkg.currency)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-8 border-t border-white/10">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Amount</p>
                        <p className="text-xs text-emerald-400 font-medium">All-Inclusive</p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-white">{formatCurrency(pricing.total, pkg.currency)}</span>
                      </div>
                    </div>
                    {pkg.currency !== 'INR' && (
                      <div className="text-right">
                        <span className="text-sm text-indigo-400 font-bold">
                          (₹{calculateInr(pricing.total, pkg.currency).toLocaleString()} approx.)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isProcessing}
                  onClick={handlePayment}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl text-white font-bold text-lg transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : isDetailsSaved ? (
                    <>
                      Pay Now
                      <CreditCard className="w-5 h-5 ml-2 transform group-hover:scale-110 transition-transform" />
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>

                {paymentSuccess && (
                  <div className="mt-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[32px] p-8 text-center animate-[fadeIn_0.5s_ease-out]">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
                    <p className="text-gray-400 text-sm mb-8">
                      Your adventure to {pkg.destination} is officially confirmed. A confirmation email with your receipt has been sent.
                    </p>

                    <div className="bg-white/5 rounded-2xl p-6 text-left space-y-4 mb-8">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Trip</span>
                        <span className="text-sm text-white font-bold">{pkg.title}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Travelers</span>
                        <span className="text-sm text-white font-bold">{numTravelers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Vehicle</span>
                        <span className="text-sm text-white font-bold capitalize">{selectedVehicle}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Date</span>
                        <span className="text-sm text-white font-bold">{paymentData?.date}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Amount</span>
                        <span className="text-sm text-emerald-400 font-bold">{formatCurrency(pricing.total, pkg.currency)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Payment ID</span>
                        <span className="text-sm text-indigo-400 font-mono">{paymentData?.paymentId}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={downloadReceipt}
                        className="bg-white/10 hover:bg-white/20 py-4 rounded-xl text-white font-bold transition-all flex items-center justify-center"
                      >
                        Receipt
                      </button>
                      <button
                        onClick={() => window.location.href = '/profile'}
                        className="bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl text-white font-bold transition-all"
                      >
                        Go to Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your payment is secured with 256-bit SSL encryption. Cancellation is free up to 48 hours before departure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Invoice Template for PDF Generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {paymentData && (
          <InvoiceTemplate
            paymentData={paymentData}
            pkg={pkg}
            userDetails={userDetails}
            numTravelers={numTravelers}
            selectedVehicle={selectedVehicle}
            pricing={pricing}
            bookingId={bookingId}
          />
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showFakeRazorpay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md p-8 text-black shadow-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">DestiniX Secure Payment</h3>
                <button onClick={() => setShowFakeRazorpay(false)}>✕</button>
              </div>

              {/* Amount */}
              <div className="mb-6">
                <p className="text-sm text-gray-500">Payable Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(pricing.total, pkg.currency)}
                </p>
              </div>

              {/* Card Input */}
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="4111 1111 1111 1111"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  maxLength={19}
                  inputMode="numeric"
                  className="w-full border rounded-xl p-3"
                />

                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    maxLength={5}
                    inputMode="numeric"
                    className="w-1/2 border rounded-xl p-3"
                  />
                  <input
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      if (digits.length <= 3) {
                        setCvv(digits);
                      }
                    }}
                    maxLength={3}
                    inputMode="numeric"
                    className="w-1/2 border rounded-xl p-3"
                  />
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={async () => {
                  if (cardNumber.replace(/\s/g, '').length < 12) {
                    alert("Invalid Card Number");
                    return;
                  }

                  if (!isExpiryValid()) {
                    alert("Invalid or Expired Card");
                    return;
                  }

                  if (cvv.length !== 3) {
                    alert("Invalid CVV");
                    return;
                  }

                  setIsPaying(true);

                  setTimeout(async () => {
                    const fakePaymentId =
                      "pay_" + Math.random().toString(36).substring(2, 15);

                    const paymentInfo = {
                      paymentId: fakePaymentId,
                      orderId: "order_" + Date.now(),
                      date: new Date().toLocaleString(),
                    };

                    setPaymentSuccess(true);
                    setPaymentData(paymentInfo);

                    // ✅ Update booking status in backend
                    if (bookingId) {
                      try {
                        await fetch('/api/update-booking', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: bookingId,
                            updates: {
                              status: 'Confirmed',
                              paymentId: fakePaymentId,
                              paymentDate: paymentInfo.date
                            }
                          })
                        });
                      } catch (err) {
                        console.error("Failed to update booking status:", err);
                      }
                    }

                    // ✅ CLOSE MODAL IMMEDIATELY
                    setShowFakeRazorpay(false);
                    setIsPaying(false);

                    // ✅ SHOW SUCCESS TOAST IMMEDIATELY
                    showToast("Payment Successful! Confirmation email sent.", "success");

                    // ⬇️ Run email in background
                    setTimeout(async () => {
                      try {
                        const currentBookingId = bookingIdRef.current;
                        const doc = await generateReceiptPDF(
                          paymentInfo,
                          pkg,
                          userDetails,
                          numTravelers,
                          selectedVehicle,
                          pricing
                        );

                        const pdfBase64 = doc.output("datauristring").split(",")[1];

                        await fetch(`${window.location.origin}/api/send-confirmation`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: userDetails.email,
                            name: userDetails.firstName,
                            packageTitle: pkg.title,
                            destination: pkg.destination,
                            vehicle: selectedVehicle,
                            travelDate: flightDetails.departureDate || carDetails.pickupDate || bikeDetails.startDate,
                            amount: pricing.total,
                            bookingId: currentBookingId,
                            paymentId: paymentInfo.paymentId,
                            pdfBase64
                          })
                        });

                      } catch (err) {
                        console.error("Email sending failed:", err);
                      }
                    }, 1000);

                  }, 2000);
                }}
                className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-bold"
              >
                {isPaying ? "Processing..." : "Pay Now"}
              </button>

              <p className="text-xs text-gray-400 mt-4 text-center">
                🔒 Secured by Destinix (Simulation Mode)
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Custom Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] pointer-events-none"
          >
            <div className="bg-indigo-600 text-white px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(79,70,229,0.4)] flex items-center space-x-3 border border-indigo-500/50 backdrop-blur-sm min-w-max">
              <Bell className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <span className="text-lg font-bold tracking-tight">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingPage;
