
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Page, User, TravelPackage } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AIPlanner from './components/AIPlanner';
import PackageCard from './components/PackageCard';
import PackageDetails from './components/PackageDetails';
import HighlightsCarousel from './components/HighlightsCarousel';
import AdvisorChat from './components/AdvisorChat';
import Auth from './components/Auth';
import Testimonials from './components/Testimonials';
import About from './components/About';
import Contact from './components/Contact';
import CTASection from './components/CTASection';
import Profile from './components/Profile';
import ScrollToTop from './components/ScrollToTop';
import BookingPage from './components/BookingPage';
import { PackageSkeleton } from './components/Skeleton';
import { MOCK_PACKAGES, MOODS, CATEGORIES } from './constants.tsx';
import PrivacyPolicy from "./components/PrivacyPolicy";
import { getCurrentUser, logout as performLogout, updateProfile } from './services/authService';

// Wrapper for PackageDetails to handle slug-based routing
const PackageDetailsWrapper: React.FC<{
  onToggleSave: (pkg: TravelPackage) => void;
  user: User | null;
  onBook: (pkg: TravelPackage) => void;
  onRequireAuth: () => void;
}> = ({ onToggleSave, user, onBook, onRequireAuth }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const pkg = MOCK_PACKAGES.find(p => p.slug === slug);

  if (!pkg) {
    return (
      <div className="pt-40 pb-24 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Package Not Found</h1>
        <button 
          onClick={() => navigate('/packages')}
          className="text-indigo-400 hover:underline"
        >
          Back to all packages
        </button>
      </div>
    );
  }

  return (
    <PackageDetails 
      pkg={pkg} 
      onBack={() => navigate(-1)}
      isSaved={user?.savedPackages?.includes(pkg.id)}
      onToggleSave={onToggleSave}
      onBook={onBook}
      onRequireAuth={onRequireAuth}
    />
  );
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Map current path to Page enum for Navbar highlight
  const currentPage = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return Page.Home;
    if (path === '/planner') return Page.Planner;
    if (path === '/packages') return Page.Packages;
    if (path.startsWith('/packages/')) return Page.PackageDetails;
    if (path === '/profile') return Page.Profile;
    if (path === '/about') return Page.About;
    if (path === '/contact') return Page.Contact;
    if (path === '/booking') return Page.Booking;
    if (path === '/privacy-policy') return Page.Home;
    return Page.Home;
  }, [location.pathname]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user on mount
  useEffect(() => {
    const activeUser = getCurrentUser();
    if (activeUser) setUser(activeUser);
  }, []);

  // Global Scroll-to-Top Fix: Trigger on path change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setShowAuth(false);
    if (currentPage === Page.Home) navigate('/planner');
  };

  const handleLogout = () => {
    performLogout();
    setUser(null);
    navigate('/');
  };

  const handleSearch = (dest: string, filters: any) => {
    setSearchQuery(dest);
    setSearchFilters(filters);
    
    // Smooth scroll to the results section directly below the Hero
    if (dest) {
      setTimeout(() => {
        const element = document.getElementById('search-results-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleBook = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    navigate('/booking');
  };

  const handleViewDetails = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    navigate(`/packages/${pkg.slug}`);
  };

  const handleNavPageChange = (page: Page) => {
    setIsLoading(true);
    setSearchQuery('');
    setSearchFilters({});
    
    // Map Page enum to routes
    switch(page) {
      case Page.Home: navigate('/'); break;
      case Page.Planner: navigate('/planner'); break;
      case Page.Packages: navigate('/packages'); break;
      case Page.About: navigate('/about'); break;
      case Page.Contact: navigate('/contact'); break;
      case Page.Profile: navigate('/profile'); break;
      case Page.Booking: navigate('/booking'); break;
      default: navigate('/');
    }
    
    setTimeout(() => setIsLoading(false), 800);
  }

  const handleToggleSave = async (pkg: TravelPackage) => {
    if (!user) {
      setNotification('Please sign in to save trips');
      setShowAuth(true);
      return;
    }

    const isCurrentlySaved = user.savedPackages?.includes(pkg.id);
    const newSaved = isCurrentlySaved 
      ? (user.savedPackages || []).filter(id => id !== pkg.id)
      : [...(user.savedPackages || []), pkg.id];
    
    try {
      const updated = await updateProfile(user.id, { savedPackages: newSaved });
      setUser(updated);
      setNotification(isCurrentlySaved ? 'Removed from bookmarks' : 'Trip bookmarked!');
    } catch (err) {
      setNotification('Failed to update bookmarks');
    }
  };

  const handleToggleAlert = async (pkg: TravelPackage) => {
    if (!user) {
      setNotification('Please sign in to set price alerts');
      setShowAuth(true);
      return;
    }

    const isCurrentlyAlerted = user.priceAlerts?.some(a => a.targetIdOrName === pkg.id);
    let newAlerts = user.priceAlerts || [];
    
    if (isCurrentlyAlerted) {
      newAlerts = newAlerts.filter(a => a.targetIdOrName !== pkg.id);
    } else {
      newAlerts = [...newAlerts, {
        id: Math.random().toString(36).substr(2, 9),
        type: 'package',
        targetIdOrName: pkg.id,
        targetPrice: pkg.price,
        createdAt: new Date()
      }];
    }
    
    try {
      const updated = await updateProfile(user.id, { priceAlerts: newAlerts });
      setUser(updated);
      setNotification(isCurrentlyAlerted ? 'Price alert removed' : 'Price alert set! We\'ll notify you of drops.');
    } catch (err) {
      setNotification('Failed to update price alerts');
    }
  };

  const handleUpdateProfile = async (updatedData: Partial<User>) => {
    if (!user) return;
    try {
      const updated = await updateProfile(user.id, updatedData);
      setUser(updated);
      setNotification('Profile updated successfully!');
    } catch (err) {
      setNotification('Failed to update profile');
    }
  };

  // Filter Logic - Independent lists for different sections
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return MOCK_PACKAGES.filter(pkg => 
      pkg.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleCategoryChange = (cat: string) => {
    setIsLoading(true);
    setActiveCategory(cat);
    setTimeout(() => setIsLoading(false), 500);
  };

  const categoryFilteredPackages = useMemo(() => {
    if (activeCategory === 'All') return MOCK_PACKAGES;
    return MOCK_PACKAGES.filter(pkg => pkg.type === activeCategory);
  }, [activeCategory]);

  // Packages specifically for Trending Section (Sorted by booking count)
  const trendingPackages = useMemo(() => {
    return [...MOCK_PACKAGES]
      .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
      .slice(0, 6);
  }, []);

  // Aggregated Highlights for the new carousel section
  const topHighlights = useMemo(() => {
    const all = MOCK_PACKAGES.flatMap(p => p.highlights || []);
    const unique = Array.from(new Set(all)).slice(0, 15);
    return unique;
  }, []);

  const renderHome = () => (
    <>
      <Hero onSearch={handleSearch} />

      {/* Search Results Section - Appears below Hero when searching */}
      {searchQuery && (
        <section id="search-results-section" className="py-24 bg-gray-950 min-h-[60vh] scroll-mt-20 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
              <div>
                <h2 className="text-indigo-400 font-bold tracking-widest uppercase mb-4 animate-[fadeIn_0.5s_ease-out]">Destination Matcher</h2>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 animate-[slideUp_0.6s_ease-out]">
                  Discovery: <span className="text-indigo-500 italic">"{searchQuery}"</span>
                </h1>
                <p className="text-gray-500 animate-[fadeIn_0.7s_ease-out]">
                  Displaying {searchResults.length} curated journeys matching your interest.
                </p>
              </div>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-white transition-all bg-white/5 px-6 py-3 rounded-2xl border border-white/10 flex items-center hover:bg-white/10 hover:border-indigo-500/50"
              >
                Reset Search ✕
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-[fadeIn_0.8s_ease-out]">
                {searchResults.map((pkg) => (
                  <PackageCard 
                    key={pkg.id} 
                    pkg={pkg} 
                    onViewDetails={handleViewDetails} 
                    onToggleSave={handleToggleSave}
                    onToggleAlert={handleToggleAlert}
                    isSaved={user?.savedPackages?.includes(pkg.id)}
                    isAlertSet={user?.priceAlerts?.some(a => a.targetIdOrName === pkg.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white/5 border border-white/10 border-dashed rounded-[40px] animate-[fadeIn_0.5s_ease-out]">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No direct matches</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Our AI couldn't find a direct match for "{searchQuery}". Try exploring our most popular spots like Dubai or Paris.</p>
                <button onClick={() => setSearchQuery('')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-colors">Show All Experiences</button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Explore by Mood Section */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-indigo-400 font-bold tracking-widest uppercase mb-4">Discovery</h2>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-16">Explore by Mood</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {MOODS.map((mood) => (
              <div 
                key={mood.id}
                className="group p-8 bg-white/5 border border-white/10 rounded-[32px] hover:bg-white/10 hover:border-indigo-500/50 transition-all hover:-translate-y-2 cursor-default select-none"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{mood.icon}</div>
                <h3 className="text-white font-bold text-sm">{mood.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Travel Highlights Section */}
      <section className="py-24 bg-black/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <HighlightsCarousel 
            items={topHighlights}
            title="Top Travel Highlights"
            subtitle="Curated Experiences"
          />
        </div>
      </section>

      {/* Trending Now Section */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h2 className="text-indigo-400 font-bold tracking-widest uppercase mb-4">World Collection</h2>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">Trending Now</h1>
            </div>
            <button onClick={() => handleNavPageChange(Page.Packages)} className="hidden md:block text-indigo-400 font-bold hover:underline pb-1">View Entire Catalog →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingPackages.map((pkg) => (
              <div 
                key={pkg.id} 
                onClick={() => handleViewDetails(pkg)}
                className="group cursor-pointer transition-transform duration-500"
              >
                <PackageCard 
                  pkg={pkg} 
                  onViewDetails={() => handleViewDetails(pkg)} 
                  onToggleSave={handleToggleSave}
                  onToggleAlert={handleToggleAlert}
                  isSaved={user?.savedPackages?.includes(pkg.id)}
                  isAlertSet={user?.priceAlerts?.some(a => a.targetIdOrName === pkg.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Packages / Category Filter */}
      <section id="collection-section" className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
            <div className="flex-1">
              <h2 className="text-indigo-400 font-bold tracking-widest uppercase mb-4">Selection</h2>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">
                Curated Packages
              </h1>
            </div>
            
            <div className="flex justify-center">
              <div className="inline-flex items-center space-x-2 bg-white/5 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-xl">
                {['All', 'International', 'Domestic', 'Luxury'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`relative px-8 py-3 rounded-[20px] text-sm font-bold transition-all duration-300 ${
                      activeCategory === cat 
                        ? 'text-white' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {activeCategory === cat && (
                      <motion.div 
                        layoutId="activeTabHome"
                        className="absolute inset-0 bg-indigo-600 rounded-[20px] shadow-lg shadow-indigo-600/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => <PackageSkeleton key={i} />)}
            </div>
          ) : categoryFilteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categoryFilteredPackages.slice(0, 8).map((pkg) => (
                <PackageCard 
                  key={pkg.id} 
                  pkg={pkg} 
                  onViewDetails={handleViewDetails} 
                  onToggleSave={handleToggleSave}
                  onToggleAlert={handleToggleAlert}
                  isSaved={user?.savedPackages?.includes(pkg.id)}
                  isAlertSet={user?.priceAlerts?.some(a => a.targetIdOrName === pkg.id)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-[40px] text-center animate-[fadeIn_0.5s_ease-out]">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-2">Group Trips launching soon!</h3>
              <p className="text-gray-500 max-w-md">Stay tuned for exciting adventures and collective journeys curated for the bold explorer.</p>
            </div>
          )}
        </div>
      </section>
      
      <Testimonials />
    </>
  );

  const renderPackages = () => (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
        <div className="mb-16">
          <h1 className="text-5xl font-serif font-bold text-white mb-4">
            {searchQuery ? `Searching for "${searchQuery}"` : 'All Packages'}
          </h1>
          <p className="text-gray-400">
            {searchQuery ? `Found ${searchResults.length} adventures matching your search.` : 'Our complete list of curated experiences.'}
          </p>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="mt-6 text-indigo-400 font-bold hover:underline flex items-center bg-white/5 px-4 py-2 rounded-xl border border-white/10"
            >
              Clear Search ✕
            </button>
          )}
       </div>
       
       {!searchQuery && (
         <div className="flex justify-center mb-16 overflow-x-auto no-scrollbar pb-4">
          <div className="inline-flex items-center space-x-1 bg-white/5 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-xl min-w-max">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`relative px-6 py-2.5 rounded-[18px] text-xs font-bold transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {activeCategory === cat && (
                  <motion.div 
                    layoutId="activeTabPackages"
                    className="absolute inset-0 bg-indigo-600 rounded-[18px] shadow-lg shadow-indigo-600/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))}
          </div>
         </div>
       )}

       {isLoading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
           {[...Array(8)].map((_, i) => <PackageSkeleton key={i} />)}
         </div>
       ) : (searchQuery ? searchResults : categoryFilteredPackages).length > 0 ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {(searchQuery ? searchResults : categoryFilteredPackages).map((pkg) => (
              <PackageCard 
                key={pkg.id} 
                pkg={pkg} 
                onViewDetails={handleViewDetails} 
                onToggleSave={handleToggleSave}
                onToggleAlert={handleToggleAlert}
                isSaved={user?.savedPackages?.includes(pkg.id)}
                isAlertSet={user?.priceAlerts?.some(a => a.targetIdOrName === pkg.id)}
              />
            ))}
         </div>
       ) : (
          <div className="py-32 flex flex-col items-center justify-center bg-white/5 border border-white/10 border-dashed rounded-[40px] text-center">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white mb-2">Group Trips launching soon!</h3>
            <p className="text-gray-500 max-w-md mx-auto">Stay tuned for exciting adventures and collective journeys curated for the bold explorer.</p>
          </div>
       )}
    </div>
  );

  const renderBooking = () => selectedPackage ? (
    <BookingPage 
      pkg={selectedPackage} 
      onBack={() => navigate(`/packages/${selectedPackage.slug}`)}
      onConfirm={(data) => {
        setNotification(`Booking confirmed for ${data.pkg.title}!`);
        navigate('/');
      }}
    />
  ) : (
    <div className="pt-32 pb-24 text-center max-w-2xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-white mb-6">Real-time Booking Engine</h1>
      <p className="text-gray-400 mb-10">Syncing with global distribution systems...</p>
      <div className="bg-white/5 border border-white/10 rounded-[40px] p-16 flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-indigo-400 font-medium">Authenticating reservations...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 overflow-x-hidden selection:bg-indigo-500/30">
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={handleNavPageChange} 
        user={user}
        onSignInClick={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-[slideDown_0.3s_ease-out]">
          <div className="bg-indigo-600/90 backdrop-blur-xl border border-white/20 px-8 py-4 rounded-full shadow-[0_0_30px_rgba(79,70,229,0.5)] text-white font-bold flex items-center space-x-3">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
            <span>{notification}</span>
          </div>
        </div>
      )}
      
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="/" element={renderHome()} />
              <Route path="/planner" element={
                <AIPlanner 
                  user={user} 
                  onNavigate={handleNavPageChange} 
                  onSignInClick={() => setShowAuth(true)} 
                />
              } />
              <Route path="/packages" element={renderPackages()} />
              <Route path="/packages/:slug" element={
                <PackageDetailsWrapper 
                  onToggleSave={handleToggleSave}
                  user={user}
                  onBook={(pkg) => {
                    if (user) {
                      setSelectedPackage(pkg);
                      navigate('/booking');
                    } else {
                      sessionStorage.setItem("pendingBookingId", pkg.id.toString());
                      setShowAuth(true);
                    }
                  }}
                  onRequireAuth={() => setShowAuth(true)}
                />
              } />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/profile" element={user ? <Profile user={user} onUpdateProfile={handleUpdateProfile} onNavigate={handleNavPageChange} onViewPackage={handleViewDetails} /> : <Navigate to="/" />} />
              <Route path="/booking" element={renderBooking()} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
        <CTASection 
          onNavigate={handleNavPageChange} 
          onRegisterClick={() => setShowAuth(true)} 
        />
      </main>

      {showAuth && (
        <Auth
          onAuthSuccess={(authenticatedUser) => {
            // Store user properly
            localStorage.setItem("user", JSON.stringify(authenticatedUser));

            // Update app state
            setUser(authenticatedUser);

            // Close modal
            setShowAuth(false);

            // Check if booking was pending
            const pendingId = sessionStorage.getItem("pendingBookingId");

            if (pendingId) {
              const pkg = MOCK_PACKAGES.find(p => p.id === pendingId);

              if (pkg) {
                setSelectedPackage(pkg);
                navigate("/booking");
              }
            }
          }}
          onCancel={() => setShowAuth(false)}
        />
      )}

      <footer className="bg-black border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mr-3"><span className="text-white font-bold text-xl">D</span></div>
              <span className="text-2xl font-bold tracking-tighter text-white uppercase">Destinix</span>
            </div>
            <p className="text-gray-400 max-w-md mb-8">Powered travel universe. Curating luxury and adventure for the bold explorer.</p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-bold mb-6">Exploration</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><button onClick={() => handleNavPageChange(Page.Planner)} className="hover:text-indigo-400 transition-colors">AI Trip Planner</button></li>
              <li><button onClick={() => handleNavPageChange(Page.Packages)} className="hover:text-indigo-400 transition-colors">Premium Packages</button></li>
              <li><button onClick={() => handleNavPageChange(Page.About)} className="hover:text-indigo-400 transition-colors">About Us</button></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><button onClick={() => handleNavPageChange(Page.Contact)} className="hover:text-indigo-400 transition-colors">Contact Support</button></li>
              <li>
                  <button 
                    onClick={() => navigate('/privacy-policy')} 
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-white font-bold mb-6">Stay Inspired</h4>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">Join 50k+ explorers receiving secret travel updates.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-12 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-colors"
                onClick={() => { if(email) { alert(`Subscribed ${email}!`); setEmail(''); }}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/5 text-center text-gray-600 text-[10px] tracking-widest uppercase">
          &copy; {new Date().getFullYear()} DestiniX. Beyond Travel.
        </div>
      </footer>

      <AdvisorChat />
      <ScrollToTop />
    </div>
  );
};

export default App;