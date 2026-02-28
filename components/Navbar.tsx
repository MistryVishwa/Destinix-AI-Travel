
import React, { useState, useEffect } from 'react';
import { Page, User } from '../types';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: User | null;
  onSignInClick: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, user, onSignInClick, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: Page.Home, label: 'Home' },
    { id: Page.Planner, label: 'AI Planner' },
    { id: Page.Packages, label: 'Packages' },
    { id: Page.About, label: 'About' },
    { id: Page.Contact, label: 'Contact' }
  ];

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
        isScrolled || isMenuOpen 
        ? 'bg-black border-b border-white/10 shadow-lg' 
        : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div 
              className="flex items-center cursor-pointer group"
              onClick={() => handlePageChange(Page.Home)}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-2 sm:mr-3 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg sm:text-xl">D</span>
              </div>
              <div className="flex items-center">
                <span className="text-xl sm:text-2xl font-bold tracking-tighter text-white uppercase">DESTINIX</span>
                <div className="ml-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-indigo-500/50 flex items-center justify-center bg-indigo-500/10">
                  <span className="text-[10px] sm:text-xs font-bold text-indigo-400">V</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handlePageChange(link.id)}
                  className={`text-sm font-medium transition-all hover:text-indigo-400 relative py-1 ${
                    currentPage === link.id ? 'text-indigo-400' : 'text-gray-300'
                  }`}
                >
                  {link.label}
                  {currentPage === link.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center">
                {user ? (
                  <div className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 group focus:outline-none"
                    >
                      <div className="w-10 h-10 rounded-full border border-indigo-500/50 overflow-hidden group-hover:border-indigo-400 transition-colors">
                        {user.avatar && user.avatar.trim() !== "" ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-white hidden lg:inline">{user.name.split(' ')[0]}</span>
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-3 w-48 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-[scaleUp_0.2s_ease-out]">
                        <button 
                          onClick={() => handlePageChange(Page.Profile)}
                          className="w-full text-left px-5 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center"
                        >
                          <span className="mr-3">👤</span> My Dashboard
                        </button>
                        <button 
                          onClick={() => handlePageChange(Page.Profile)}
                          className="w-full text-left px-5 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center"
                        >
                          <span className="mr-3">⚙️</span> Settings
                        </button>
                        <div className="h-px bg-white/5 mx-2 my-1" />
                        <button 
                          onClick={onLogout}
                          className="w-full text-left px-5 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center"
                        >
                          <span className="mr-3">🚪</span> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={onSignInClick}
                    className="text-sm font-medium text-gray-300 hover:text-white transition-all px-3 py-2 rounded-full hover:bg-white/5"
                  >
                    Sign In
                  </button>
                )}
              </div>

              <button 
                onClick={() => handlePageChange(Page.Planner)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-105"
              >
                Plan a Trip
              </button>

              {/* Hamburger Menu Icon */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Menu */}
        <div className={`fixed inset-y-0 right-0 w-full bg-black/95  z-[-1] transition-all duration-500 ease-in-out transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } md:hidden`}>
          <div className="flex flex-col h-full pt-24 px-6">
            <div className="space-y-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handlePageChange(link.id)}
                  className={`block w-full text-left text-2xl font-serif font-bold transition-all ${
                    currentPage === link.id ? 'text-indigo-400' : 'text-gray-300'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {user && (
                <button
                  onClick={() => handlePageChange(Page.Profile)}
                  className={`block w-full text-left text-2xl font-serif font-bold transition-all ${
                    currentPage === Page.Profile ? 'text-indigo-400' : 'text-gray-300'
                  }`}
                >
                  My Profile
                </button>
              )}
            </div>

            <div className="mt-auto pb-12 pt-8 border-t border-white/5">
              {user ? (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-3 text-indigo-400 mb-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/50 overflow-hidden flex items-center justify-center font-bold">
                      {user.avatar && user.avatar.trim() !== "" ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { onLogout(); setIsMenuOpen(false); }}
                    className="w-full py-4 text-center bg-white/5 rounded-2xl text-gray-300 font-bold hover:bg-white/10"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { onSignInClick(); setIsMenuOpen(false); }}
                  className="w-full py-4 text-center bg-indigo-600 rounded-2xl text-white font-bold hover:bg-indigo-500"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[55] bg-black/50 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
