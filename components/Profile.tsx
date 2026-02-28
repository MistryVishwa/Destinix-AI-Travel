
import React, { useState, useRef, useEffect } from 'react';
import { User as UserType, TripPlan, PriceAlert, TravelPackage, Page, Booking } from '../types';
import { updateProfile } from '../services/authService';
import { MOCK_PACKAGES } from '../constants.tsx';
import PackageCard from './PackageCard';
import { generateReceiptPDF } from '../utils/receipt';
import { formatCurrency } from '../utils/currency';
import InvoiceTemplate from './InvoiceTemplate';
import { 
  Calendar, MapPin, CreditCard, Download, ChevronRight, 
  Clock, CheckCircle, AlertCircle, Loader2, Plane, 
  Hotel, Users, Bell, User as UserIcon 
} from 'lucide-react';

interface ProfileProps {
  user: UserType;
  onUpdateProfile: (updates: Partial<UserType>) => void;
  onNavigate: (page: Page) => void;
  onViewPackage: (pkg: TravelPackage) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateProfile, onNavigate, onViewPackage }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'trips' | 'alerts' | 'bookings'>('bookings');
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || '',
    address: user.address || '',
    preferences: (user.preferences || []).join(', ')
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [savedTrips, setSavedTrips] = useState<TripPlan[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);
  const [activeBookingForReceipt, setActiveBookingForReceipt] = useState<Booking | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const trips = JSON.parse(localStorage.getItem('destinix_saved_trips') || '[]');
    setSavedTrips(trips);
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab, user.email]);

  const fetchBookings = async () => {
    setFetchingBookings(true);
    try {
      const res = await fetch(`/api/my-bookings?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.sort((a: Booking, b: Booking) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setFetchingBookings(false);
    }
  };

  const handleDownloadReceipt = async (booking: Booking) => {
    setDownloadingReceiptId(booking.id);
    setActiveBookingForReceipt(booking);

    // Give React a moment to render the hidden template
    setTimeout(async () => {
      try {
        const doc = await generateReceiptPDF();
        doc.save(`Destinix_Receipt_${booking.paymentId || booking.id}.pdf`);
      } catch (err) {
        console.error("Receipt download failed:", err);
      } finally {
        setDownloadingReceiptId(null);
        setActiveBookingForReceipt(null);
      }
    }, 800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await onUpdateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        preferences: formData.preferences.split(',').map(p => p.trim()).filter(p => p)
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 2MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          await onUpdateProfile({ avatar: base64String });
          setMessage({ type: 'success', text: 'Profile picture updated!' });
        } catch (err: any) {
          setMessage({ type: 'error', text: 'Failed to upload image' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = async () => {
    try {
      await onUpdateProfile({ avatar: '' });
      setMessage({ type: 'success', text: 'Profile picture removed' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to remove image' });
    }
  };

  const savedPackages = MOCK_PACKAGES.filter(p => user.savedPackages?.includes(p.id));

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-4">
      {/* Profile Header - Matched to Screenshot */}
      <div className="flex flex-col items-center mb-16 animate-[fadeIn_0.5s_ease-out]">
        <div className="relative mb-6">
          <div className="w-36 h-36 rounded-full overflow-hidden bg-indigo-500/10 border-4 border-indigo-600/50 shadow-[0_0_40px_rgba(79,102,241,0.25)] flex items-center justify-center">
            {user.avatar && user.avatar.trim() !== "" ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl font-serif font-bold text-indigo-400 uppercase bg-gradient-to-br from-indigo-900/40 to-slate-900">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 p-2.5 bg-indigo-600 rounded-full text-white shadow-xl hover:bg-indigo-500 transition-all border-4 border-[#030712] z-10"
            title="Change Avatar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
        </div>

        <h2 className="text-5xl font-serif font-bold text-white mb-3 tracking-tight">{user.name}</h2>
        <p className="text-gray-500 font-medium text-lg">{user.email}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 sticky top-32">
            <div className="space-y-2">
              {[
                { id: 'bookings', label: 'My Bookings', icon: <CreditCard className="w-5 h-5" /> },
                { id: 'settings', label: 'Profile Settings', icon: <UserIcon className="w-5 h-5" /> },
                { id: 'trips', label: 'Saved Trips', icon: <Plane className="w-5 h-5" /> },
                { id: 'alerts', label: 'Price Alerts', icon: <Bell className="w-5 h-5" /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <span className={`${activeTab === tab.id ? 'text-white' : 'text-indigo-400'}`}>{tab.icon}</span>
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:w-3/4">
          {message && (
            <div className={`mb-8 p-4 rounded-2xl border flex items-center space-x-3 animate-[fadeIn_0.3s_ease-out] ${
              message.type === 'success' ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{message.text}</span>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 animate-[fadeIn_0.5s_ease-out]">
              <h1 className="text-3xl font-serif font-bold text-white mb-8">Personal Information</h1>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                    <input name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email (Locked)</label>
                    <input disabled type="email" value={user.email} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                  <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+1 555-000-0000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Home Address</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Your primary shipping/billing address" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 transition-all resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Travel Preferences (Comma separated)</label>
                  <input name="preferences" type="text" value={formData.preferences} onChange={handleInputChange} placeholder="e.g. Hiking, Luxury, Foodie, Late Night" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-xl shadow-indigo-600/20">
                  {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'trips' && (
            <div className="space-y-12 animate-[fadeIn_0.5s_ease-out]">
              {/* Saved Packages Section */}
              <section>
                <h1 className="text-3xl font-serif font-bold text-white mb-2">Saved Packages</h1>
                <p className="text-gray-500 mb-8">Hand-picked destinations you've marked for later.</p>
                {savedPackages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedPackages.map(pkg => (
                      <PackageCard 
                        key={pkg.id} 
                        pkg={pkg} 
                        isSaved 
                        onViewDetails={() => onViewPackage(pkg)} 
                        onToggleSave={() => {
                          const newSaved = (user.savedPackages || []).filter(id => id !== pkg.id);
                          onUpdateProfile({ savedPackages: newSaved });
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 border-dashed rounded-[40px] py-12 text-center">
                    <p className="text-gray-500 text-sm">No packages saved yet. Start exploring our collection!</p>
                  </div>
                )}
              </section>

              {/* Saved AI Trips Section */}
              <section>
                <h1 className="text-3xl font-serif font-bold text-white mb-2">AI Planned Journeys</h1>
                <p className="text-gray-500 mb-8">Custom itineraries generated by our smart architect.</p>
                {savedTrips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedTrips.map((trip, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-indigo-500/50 transition-all group relative">
                        <button 
                          onClick={() => {
                            const newTrips = savedTrips.filter((_, index) => index !== i);
                            localStorage.setItem('destinix_saved_trips', JSON.stringify(newTrips));
                            setSavedTrips(newTrips);
                          }}
                          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        <div className="flex justify-between items-start mb-4 pr-8">
                          <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{trip.destination}</h3>
                          <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">{trip.duration} Days</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-6 line-clamp-2">Vibe: {trip.vibe}</p>
                        <button className="text-indigo-400 text-sm font-bold flex items-center hover:underline">
                          View Itinerary <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 border-dashed rounded-[40px] py-12 text-center">
                    <p className="text-gray-500 text-sm">No AI plans saved yet.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="animate-[fadeIn_0.5s_ease-out]">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-white mb-2">My Bookings</h1>
                  <p className="text-gray-500">Manage your upcoming adventures and view past trips.</p>
                </div>
                <button 
                  onClick={fetchBookings}
                  className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                  title="Refresh Bookings"
                >
                  <Clock className={`w-5 h-5 ${fetchingBookings ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {fetchingBookings && bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-gray-500 font-medium">Fetching your bookings...</p>
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-6">
                  {bookings.map((booking) => (
                    
                    <div key={booking.id} className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden hover:border-indigo-500/30 transition-all group">
                      <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                          {(booking as any).packageImage && (
                            <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
                              <img src={(booking as any).packageImage} alt={booking.packageTitle} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {booking.status === 'Confirmed' ? 'Booking Confirmed' : booking.status}
                              </span>
                              <span className="text-xs text-gray-500 font-mono">#{booking.id.slice(-6)}</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">
                              {booking.packageTitle}
                            </h3>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                              <div className="flex items-center space-x-3">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Booked On</p>
                                  <p className="text-sm text-gray-300">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <CreditCard className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Amount</p>
                                  <p className="text-sm text-white font-bold">{formatCurrency(booking.totalAmount, booking.currency)}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Vehicle</p>
                                  <p className="text-sm text-gray-300 capitalize">{booking.selectedVehicle || 'Standard'}</p>
                                </div>
                              </div>
                              {booking.flight && (
                                <div className="flex items-center space-x-3">
                                  <Plane className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Flight</p>
                                    <p className="text-sm text-gray-300">{booking.flight.airline} ({booking.flight.class})</p>
                                  </div>
                                </div>
                              )}
                              {booking.hotel && (
                                <div className="flex items-center space-x-3">
                                  <Hotel className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Hotel</p>
                                    <p className="text-sm text-gray-300">{booking.hotel.name} ({booking.hotel.stars}★)</p>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center space-x-3">
                                <Users className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Travelers</p>
                                  <p className="text-sm text-gray-300">{booking.numTravelers}</p>
                                </div>
                              </div>
                              {booking.addons && booking.addons.length > 0 && (
                                <div className="flex items-start space-x-3 col-span-2 md:col-span-3">
                                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-1" />
                                  <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Add-ons</p>
                                    <p className="text-sm text-gray-300">{booking.addons.join(', ')}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col justify-center space-y-3 md:w-48">
                              {booking.status === 'Confirmed' && (
                                <button 
                                  onClick={() => handleDownloadReceipt(booking)}
                                  disabled={downloadingReceiptId === booking.id}
                                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                                >
                                  {downloadingReceiptId === booking.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                  <span>{downloadingReceiptId === booking.id ? 'Downloading...' : 'Receipt Download'}</span>
                                </button>
                              )}
                            <button 
                              onClick={() => {
                                const pkg = MOCK_PACKAGES.find(p => p.id === booking.packageId);
                                if (pkg) onViewPackage(pkg);
                              }}
                              className="w-full flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-white text-sm font-bold transition-all"
                            >
                              <ChevronRight className="w-4 h-4" />
                              <span>View Package</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 border-dashed rounded-[40px] py-24 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CreditCard className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No bookings found</h3>
                  <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">You haven't booked any trips yet. Explore our packages to start your journey!</p>
                  <button 
                    onClick={() => onNavigate(Page.Packages)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-all"
                  >
                    Explore Packages
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="animate-[fadeIn_0.5s_ease-out]">
              <h1 className="text-3xl font-serif font-bold text-white mb-2">Price Alerts</h1>
              <p className="text-gray-500 mb-8">Get notified when prices drop for your favorite destinations.</p>
              
              {user.priceAlerts && user.priceAlerts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {user.priceAlerts.map((alert) => {
                    const pkg = MOCK_PACKAGES.find(p => p.id === alert.targetIdOrName);
                    return (
                      <div key={alert.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                          </div>
                          <div>
                            <h4 className="text-white font-bold">{pkg?.title || alert.targetIdOrName}</h4>
                            <p className="text-xs text-gray-500">Tracking since {new Date(alert.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Target Price</p>
                            <p className="text-indigo-400 font-bold">{pkg?.currency} {alert.targetPrice?.toLocaleString()}</p>
                          </div>
                          <button 
                            onClick={() => {
                              const newAlerts = user.priceAlerts?.filter(a => a.id !== alert.id);
                              onUpdateProfile({ priceAlerts: newAlerts });
                            }}
                            className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 border-dashed rounded-[40px] py-24 text-center">
                  <p className="text-gray-500">You are not currently tracking any destination prices.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Hidden Invoice Template for PDF Generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {activeBookingForReceipt && (
          <InvoiceTemplate
            paymentData={{
              paymentId: activeBookingForReceipt.paymentId || 'N/A',
              date: activeBookingForReceipt.createdAt
            }}
            pkg={MOCK_PACKAGES.find(p => p.id === activeBookingForReceipt.packageId) || {
              title: activeBookingForReceipt.packageTitle,
              destination: activeBookingForReceipt.city || 'Unknown',
              currency: activeBookingForReceipt.currency,
              type: 'Standard'
            }}
            userDetails={{
              firstName: activeBookingForReceipt.firstName,
              lastName: activeBookingForReceipt.lastName,
              email: activeBookingForReceipt.email,
              phone: activeBookingForReceipt.phone,
              address: activeBookingForReceipt.address || 'N/A',
              city: activeBookingForReceipt.city || 'N/A',
              zipCode: activeBookingForReceipt.zipCode || 'N/A'
            }}
            numTravelers={activeBookingForReceipt.numTravelers || 1}
            selectedVehicle={activeBookingForReceipt.selectedVehicle || null}
            pricing={activeBookingForReceipt.pricing || {
              base: activeBookingForReceipt.totalAmount * 0.85,
              taxes: activeBookingForReceipt.totalAmount * 0.10,
              service: activeBookingForReceipt.totalAmount * 0.05,
              vehicleCharge: 0,
              total: activeBookingForReceipt.totalAmount
            }}
            bookingId={activeBookingForReceipt.id}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
