import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SiGreenhouse } from "react-icons/si";
import { useUser } from './global-context/context_provider';
import { BsPlusSquare, BsPersonCircle, BsBoxArrowRight, BsGrid3X3Gap } from "react-icons/bs";


export default function Navbar() {
  // Get user authentication state
  const { user, setUser } = useUser();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  
  // Light/Dark mode toggle (class-based)
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = saved ? saved === 'dark' : prefersDark;
    setDark(initialDark);
    document.documentElement.classList.toggle('dark', initialDark);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Handle click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    // Clear user from context
    setUser(null);
    // Clear auth token from localStorage
    localStorage.removeItem('authToken');
    // Close menu
    setShowUserMenu(false);
    // Redirect to home page
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 ${
        scrolled
          ? 'border-b border-gray-200 dark:border-gray-800 shadow-md'
          : 'border-b border-transparent'
      } bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 transition-all duration-200`}
    >
      <nav className="container mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center gap-2">
              <SiGreenhouse className="h-13 w-13 text-green-400" />
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">Gate City Gigs</span>
            </Link>
          </div>

          {/* Center: Create Gig Button */}
          <div className="flex items-center justify-center flex-1 px-4">
            {/* Only show Create Gig button when user is authenticated */}
            {isAuthenticated && (
              <Link 
                to="/add-gig" 
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors dark:bg-green-500 dark:hover:bg-green-600"
              >
                <BsPlusSquare className="h-5 w-5" />
                <span>Create Gig</span>
              </Link>
            )}
          </div>

          {/* Right: Home, Dashboard, Your Profile, and Sign in */}
          <div className="flex items-center justify-end flex-1 gap-4">
            <Link to="/" className="text-sm font-medium text-green-200 hover:text-green-300 transition-colors">
              Home
            </Link>
            {/* Only show Dashboard when user is authenticated */}
            {isAuthenticated && (
              <Link to="/job-map" className="text-sm font-medium text-green-200 hover:text-green-300 transition-colors">
                Dashboard
              </Link>
            )}
            {/* Only show Your Profile when user is authenticated */}
            {isAuthenticated && (
              <Link to="/your-profile" className="text-sm font-medium text-green-200 hover:text-green-300 transition-colors" data-discover="true">
                Your Profile
              </Link>
            )}
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors dark:bg-green-500 dark:hover:bg-green-600"
              >
                Sign In
              </Link>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="User menu"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="User avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-green-400"
                    />
                  ) : (
                    <BsPersonCircle className="w-10 h-10 text-green-400 hover:text-green-500 transition-colors" />
                  )}
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <Link
                      to="/job-map"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <BsGrid3X3Gap className="w-4 h-4" />
                        <span>Dashboard</span>
                      </div>
                    </Link>
                    <Link
                      to="/your-profile"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <BsPersonCircle className="w-4 h-4" />
                        <span>Your Profile</span>
                      </div>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <BsBoxArrowRight className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
