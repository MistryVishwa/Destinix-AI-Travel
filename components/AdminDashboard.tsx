import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Edit, Trash2, Loader2, CheckCircle2, XCircle, Search, 
  TrendingUp, Box, Users, CreditCard, ChevronRight, X, AlertCircle, RefreshCw
} from 'lucide-react';
import { TravelPackage, User, Booking } from '../types';
import { 
  getPackages, createPackage, updatePackage, deletePackage, 
  getAdminBookings, updateBookingStatus 
} from '../services/packageService';
import { formatCurrency } from '../utils/currency';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const CATEGORIES = [
  'International', 'Domestic', 'Honeymoon', 'Family', 'Adventure', 'Luxury', 'Budget', 'Weekend', 'Group', 'Ultra-Luxury'
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'THB', 'AED', 'JPY', 'GBP', 'SGD'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'bookings'>('overview');
  
  // Data States
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Loading & Error States
  const [loadingPkgs, setLoadingPkgs] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form / Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<TravelPackage | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    duration: '',
    price: '',
    currency: 'INR',
    type: 'Domestic',
    image: '',
    description: '',
    rating: '5.0',
    highlights: '',
    gallery: '',
    bookingCount: '0',
    viewCount: '0'
  });

  // Search States
  const [pkgSearch, setPkgSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');

  // Load initial data
  useEffect(() => {
    loadPackagesData();
    loadBookingsData();
  }, []);

  const loadPackagesData = async () => {
    setLoadingPkgs(true);
    try {
      const pkgs = await getPackages();
      setPackages(pkgs);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load packages. Please check connection.');
    } finally {
      setLoadingPkgs(false);
    }
  };

  const loadBookingsData = async () => {
    setLoadingBookings(true);
    try {
      if (user.token) {
        const bks = await getAdminBookings(user.token);
        setBookings(bks);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load platform bookings.');
    } finally {
      setLoadingBookings(false);
    }
  };

  // Auto-hide success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-hide error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle Edit click
  const handleEditClick = (pkg: TravelPackage) => {
    setEditingPkg(pkg);
    setFormData({
      title: pkg.title,
      destination: pkg.destination,
      duration: pkg.duration,
      price: pkg.price.toString(),
      currency: pkg.currency,
      type: pkg.type,
      image: pkg.image || '',
      description: pkg.description || '',
      rating: (pkg.rating || 5.0).toString(),
      highlights: (pkg.highlights || []).join(', '),
      gallery: (pkg.gallery || []).join(', '),
      bookingCount: (pkg.bookingCount || 0).toString(),
      viewCount: (pkg.viewCount || 0).toString()
    });
    setIsFormOpen(true);
  };

  // Open create form
  const handleCreateClick = () => {
    setEditingPkg(null);
    setFormData({
      title: '',
      destination: '',
      duration: '',
      price: '',
      currency: 'INR',
      type: 'Domestic',
      image: '',
      description: '',
      rating: '5.0',
      highlights: '',
      gallery: '',
      bookingCount: '0',
      viewCount: '0'
    });
    setIsFormOpen(true);
  };

  // Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.token) return;
    
    setActionLoading(true);
    setError(null);
    
    const preparedPkg = {
      title: formData.title,
      destination: formData.destination,
      duration: formData.duration,
      price: parseFloat(formData.price),
      currency: formData.currency as any,
      type: formData.type as any,
      image: formData.image || undefined,
      description: formData.description,
      rating: parseFloat(formData.rating) || 5.0,
      highlights: formData.highlights.split(',').map(s => s.trim()).filter(s => s),
      gallery: formData.gallery.split(',').map(s => s.trim()).filter(s => s),
      bookingCount: parseInt(formData.bookingCount) || 0,
      viewCount: parseInt(formData.viewCount) || 0
    };

    try {
      if (editingPkg) {
        // Update
        const updated = await updatePackage(user.token, editingPkg.id, preparedPkg);
        setPackages(prev => prev.map(p => p.id === editingPkg.id ? updated : p));
        setSuccess('Package updated successfully!');
      } else {
        // Create
        const created = await createPackage(user.token, preparedPkg);
        setPackages(prev => [created, ...prev]);
        setSuccess('New travel package created!');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Operation failed. Verify inputs.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete package
  const handleDeletePackage = async (id: string) => {
    if (!user.token || !window.confirm('Are you sure you want to delete this travel package?')) return;
    
    setActionLoading(true);
    setError(null);
    try {
      await deletePackage(user.token, id);
      setPackages(prev => prev.filter(p => p.id !== id));
      setSuccess('Package deleted successfully.');
    } catch (err: any) {
      console.error(err);
      setError('Failed to delete package.');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId: string, status: 'Pending' | 'Confirmed' | 'Cancelled') => {
    if (!user.token) return;
    
    setActionLoading(true);
    setError(null);
    try {
      await updateBookingStatus(user.token, bookingId, status);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      setSuccess(`Booking status updated to ${status}!`);
    } catch (err: any) {
      console.error(err);
      setError('Failed to update booking status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Statistics Calculations
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
    
    // Convert estimated total revenue to INR for unified charting
    const totalRevenue = confirmedBookings.reduce((sum, b) => {
      let amount = b.totalAmount;
      if (b.currency === 'USD') amount *= 83;
      else if (b.currency === 'EUR') amount *= 90;
      else if (b.currency === 'AED') amount *= 22.5;
      else if (b.currency === 'GBP') amount *= 105;
      else if (b.currency === 'SGD') amount *= 61.5;
      return sum + amount;
    }, 0);

    const activePackages = packages.length;
    const uniqueUsers = new Set(bookings.map(b => b.email)).size;

    return {
      totalBookings,
      totalRevenue,
      activePackages,
      uniqueUsers
    };
  }, [bookings, packages]);

  // Filters for Packages
  const filteredPackages = useMemo(() => {
    if (!pkgSearch.trim()) return packages;
    return packages.filter(p => 
      p.title.toLowerCase().includes(pkgSearch.toLowerCase()) ||
      p.destination.toLowerCase().includes(pkgSearch.toLowerCase()) ||
      p.type.toLowerCase().includes(pkgSearch.toLowerCase())
    );
  }, [pkgSearch, packages]);

  // Filters for Bookings
  const filteredBookings = useMemo(() => {
    if (!bookingSearch.trim()) return bookings;
    return bookings.filter(b => 
      b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.firstName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.lastName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.email.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.packageTitle.toLowerCase().includes(bookingSearch.toLowerCase())
    );
  }, [bookingSearch, bookings]);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl animate-[fadeIn_0.5s_ease-out]">
        <div>
          <span className="inline-flex items-center space-x-1 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full mb-3 text-[10px] font-bold uppercase tracking-widest text-red-400">
            🛡️ Administrative Shell
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 leading-tight">
            Control Dashboard
          </h1>
          <p className="text-gray-400 text-sm">
            Logged in as <span className="text-indigo-400 font-bold">{user.email}</span>
          </p>
        </div>
        <button
          onClick={onLogout}
          className="mt-6 md:mt-0 px-6 py-3 bg-red-600/10 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all text-red-400 font-bold rounded-2xl text-sm"
        >
          Exit Shell 🚪
        </button>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm flex items-center space-x-3"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl sticky top-32">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Overview Metrics</span>
              </button>
              
              <button
                onClick={() => setActiveTab('packages')}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === 'packages' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <Box className="w-5 h-5" />
                <span className="text-sm">Manage Packages</span>
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === 'bookings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-sm">User Bookings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="lg:w-3/4">
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Bookings */}
                <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 backdrop-blur-xl hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Total Bookings</span>
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><Users className="w-5 h-5" /></div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{stats.totalBookings}</h3>
                  <p className="text-xs text-gray-500">Across the entire platform</p>
                </div>

                {/* Total Volume */}
                <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 backdrop-blur-xl hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Est. Volume (INR)</span>
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400"><CreditCard className="w-5 h-5" /></div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">₹{Math.round(stats.totalRevenue).toLocaleString('en-IN')}</h3>
                  <p className="text-xs text-gray-500">Confirmed transactions</p>
                </div>

                {/* Active Packages */}
                <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 backdrop-blur-xl hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Active Products</span>
                    <div className="p-2 bg-teal-500/10 rounded-xl text-teal-400"><Box className="w-5 h-5" /></div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{stats.activePackages}</h3>
                  <p className="text-xs text-gray-500">Curated travel packages</p>
                </div>

                {/* Platform Travelers */}
                <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 backdrop-blur-xl hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Unique Users</span>
                    <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400"><Users className="w-5 h-5" /></div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{stats.uniqueUsers}</h3>
                  <p className="text-xs text-gray-500">Verified emails with bookings</p>
                </div>
              </div>

              {/* High Level Instructions */}
              <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-12 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <h3 className="text-2xl font-bold text-white mb-4">Quick Operations Guide</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Welcome back to the Destinix Administrator control panel. As an admin, you can manage the primary catalog content. Any modifications made here are updated in real-time on Supabase database, and instantly update the package cards, bookmarks, and booking flows for all users.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
                  <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <span className="font-bold text-indigo-400 block mb-1">Package Manager</span>
                    Review active items, add custom destinations, update pricing or description, and delete stale listings.
                  </div>
                  <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <span className="font-bold text-indigo-400 block mb-1">Bookings Monitor</span>
                    View recent transactions. Process user verification states by changing statuses from Pending to Confirmed/Cancelled.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE PACKAGES */}
          {activeTab === 'packages' && (
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                {/* Search Field */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search package title, category..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    value={pkgSearch}
                    onChange={(e) => setPkgSearch(e.target.value)}
                  />
                </div>
                
                {/* Add Package Button */}
                <button
                  onClick={handleCreateClick}
                  className="bg-indigo-600 hover:bg-indigo-500 transition-all px-6 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center space-x-2 shrink-0 shadow-lg shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Package</span>
                </button>
              </div>

              {/* Packages Table Card */}
              <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl">
                {loadingPkgs ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-gray-500 font-medium">Fetching catalog packages...</p>
                  </div>
                ) : filteredPackages.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-gray-500 text-[10px] font-bold uppercase tracking-widest bg-white/[0.02]">
                          <th className="px-6 py-4">Title / Destination</th>
                          <th className="px-6 py-4">Duration</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4 text-right">Price</th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {filteredPackages.map((pkg) => (
                          <tr key={pkg.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-5">
                              <div className="flex items-center space-x-3">
                                {pkg.image && (
                                  <div className="w-12 h-8 rounded-lg overflow-hidden shrink-0">
                                    <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-white font-bold text-sm group-hover:text-indigo-400 transition-colors">{pkg.title}</p>
                                  <p className="text-xs text-gray-500">{pkg.destination}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-gray-300 font-medium">{pkg.duration}</td>
                            <td className="px-6 py-5">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/5 text-gray-400">
                                {pkg.type}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right text-indigo-400 font-bold">
                              {formatCurrency(pkg.price, pkg.currency)}
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleEditClick(pkg)}
                                  className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
                                  title="Edit Package"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePackage(pkg.id)}
                                  className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                                  title="Delete Package"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <Box className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-white font-bold mb-2">No packages found</h4>
                    <p className="text-gray-500 text-sm">Create a package to begin.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: USER BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search client email, name, destination..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                  />
                </div>
                
                {/* Refresh Trigger */}
                <button
                  onClick={loadBookingsData}
                  className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition-all ml-4"
                  title="Refresh Bookings"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingBookings ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Bookings Card Container */}
              <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl">
                {loadingBookings ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-gray-500 font-medium">Fetching platform bookings...</p>
                  </div>
                ) : filteredBookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-gray-500 text-[10px] font-bold uppercase tracking-widest bg-white/[0.02]">
                          <th className="px-6 py-4">Booking Ref</th>
                          <th className="px-6 py-4">Client</th>
                          <th className="px-6 py-4">Travel Details</th>
                          <th className="px-6 py-4 text-right">Paid</th>
                          <th className="px-6 py-4 text-center">Status / Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                            {/* Ref */}
                            <td className="px-6 py-5 font-mono text-xs text-gray-500">
                              #{b.id.slice(-6).toUpperCase()}
                            </td>
                            {/* Client */}
                            <td className="px-6 py-5">
                              <div>
                                <p className="text-white font-bold">{b.firstName} {b.lastName}</p>
                                <p className="text-xs text-gray-500">{b.email}</p>
                              </div>
                            </td>
                            {/* Destination */}
                            <td className="px-6 py-5">
                              <div>
                                <p className="text-gray-200 font-medium">{b.packageTitle}</p>
                                <p className="text-[10px] text-gray-500">
                                  {new Date(b.createdAt).toLocaleDateString()} • {b.numTravelers} traveler{b.numTravelers > 1 ? 's' : ''}
                                </p>
                              </div>
                            </td>
                            {/* Paid */}
                            <td className="px-6 py-5 text-right font-bold text-white">
                              {formatCurrency(b.totalAmount, b.currency)}
                            </td>
                            {/* Status and Action */}
                            <td className="px-6 py-5">
                              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  b.status === 'Confirmed' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : b.status === 'Cancelled'
                                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {b.status}
                                </span>

                                {b.status === 'Pending' && (
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => handleUpdateBookingStatus(b.id, 'Confirmed')}
                                      className="p-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-500/20 transition-all"
                                      title="Confirm Booking"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleUpdateBookingStatus(b.id, 'Cancelled')}
                                      className="p-1 bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg border border-red-500/20 transition-all"
                                      title="Cancel Booking"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-white font-bold mb-2">No bookings found</h4>
                    <p className="text-gray-500 text-sm">Users have not reserved any packages yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Package Form Modal / Drawer */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => { if (!actionLoading) setIsFormOpen(false); }}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-[32px] p-8 shadow-2xl flex flex-col backdrop-blur-xl z-10 my-8 max-h-[85vh] overflow-y-auto pr-6"
            >
              {/* Close Icon */}
              <button
                onClick={() => setIsFormOpen(false)}
                disabled={actionLoading}
                className="absolute top-6 right-6 w-9 h-9 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all border border-white/5 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-serif font-bold text-white leading-tight">
                  {editingPkg ? 'Edit Travel Package' : 'Create New Package'}
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  Fill in detail configuration below. Highlights and gallery are input as comma-separated values.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Package Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kyoto Cherry Blossom Tour"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  
                  {/* Destination */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Destination City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kyoto"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Price</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 2500"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Currency</label>
                    <select
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    >
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Duration</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5 Days"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category / Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Product Category</label>
                    <select
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      {CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Rating (1.0 to 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    />
                  </div>
                </div>

                {/* Hero Image */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Hero Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                {/* Highlights */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Highlights (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. City Tour, Private Villa, Candlelight Dinner"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    value={formData.highlights}
                    onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  />
                </div>

                {/* Gallery */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Gallery Images (Comma Separated URLs)</label>
                  <textarea
                    placeholder="e.g. https://url1.com, https://url2.com"
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
                    value={formData.gallery}
                    onChange={(e) => setFormData({ ...formData, gallery: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Description</label>
                  <textarea
                    required
                    placeholder="Brief description of the luxury journey..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Booking Count */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Initial Booking Count</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={formData.bookingCount}
                      onChange={(e) => setFormData({ ...formData, bookingCount: e.target.value })}
                    />
                  </div>

                  {/* View Count */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Initial View Count</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={formData.viewCount}
                      onChange={(e) => setFormData({ ...formData, viewCount: e.target.value })}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 transition-all py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingPkg ? 'Update Package' : 'Create Package'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3.5 rounded-2xl text-gray-300 font-bold text-sm transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
