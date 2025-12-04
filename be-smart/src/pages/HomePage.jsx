import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import gCom from '../assets/Greensboro-Com.mp4';
import PricingSection from './PricingSection';
import Chatbot from '../components/chatbot/chatbot';
import ViewTopReports from './ViewTopReports';
import { getAllGigs } from '../middlewares/gigs.js';

export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [allGigs, setAllGigs] = useState([]);
  const [filteredGigs, setFilteredGigs] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoadingGigs, setIsLoadingGigs] = useState(false);
  const videoRef = useRef(null);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  const suggestedServices = [
    'Website Development',
    'Architecture & Interior Design',
    'UGC Videos',
    'Video Editing',
    'Content Creation',
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, []);

  // Load all gigs when component mounts
  useEffect(() => {
    const loadGigs = async () => {
      if (allGigs.length === 0 && !isLoadingGigs) {
        setIsLoadingGigs(true);
        try {
          const gigs = await getAllGigs();
          setAllGigs(gigs);
        } catch (error) {
          console.error('Error loading gigs:', error);
        } finally {
          setIsLoadingGigs(false);
        }
      }
    };

    loadGigs();
  }, [allGigs.length, isLoadingGigs]);

  // Show results when gigs are loaded and input is focused
  useEffect(() => {
    if (allGigs.length > 0 && searchInputRef.current === document.activeElement) {
      setShowResults(true);
    }
  }, [allGigs.length]);

  // Filter gigs by name when search query changes
  useEffect(() => {
    if (allGigs.length > 0) {
      if (searchQuery.trim() === '') {
        // Show top 3-4 gigs when no search query
        const topGigs = allGigs.slice(0, 4);
        setFilteredGigs(topGigs);
      } else {
        // Filter by name when there's a search query
        const filtered = allGigs.filter(gig =>
          gig.gig_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredGigs(filtered);
      }
    }
  }, [searchQuery, allGigs]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or job map with query
      navigate(`/job-map?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleInputFocus = async () => {
    // Load gigs if not already loaded
    if (allGigs.length === 0 && !isLoadingGigs) {
      setIsLoadingGigs(true);
      try {
        const gigs = await getAllGigs();
        setAllGigs(gigs);
      } catch (error) {
        console.error('Error loading gigs:', error);
      } finally {
        setIsLoadingGigs(false);
      }
    }
    
    // Show results dropdown when focused (will show top 3-4 or filtered results)
    if (allGigs.length > 0) {
      setShowResults(true);
    }
  };

  const handleGigClick = (gig) => {
    setSearchQuery(gig.gig_name);
    setShowResults(false);
    // Optionally navigate to gig details or job map
    navigate(`/job-map?search=${encodeURIComponent(gig.gig_name)}`);
  };

  const toggleVideo = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  };

  return (
    <>
      <Navbar />

      {/* Fiverr-style Hero Section with Background Video */}
      <section className="relative overflow-hidden min-h-screen">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            style={{
              filter: 'brightness(0.4) contrast(1.1) saturate(0.7) blur(1px)',
            }}
          >
            <source src={gCom} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 min-h-screen flex flex-col">
          {/* Main Hero Content */}
          <div className="flex-1 flex items-center">
            <div className="max-w-4xl">
              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-tight mb-6">
                Our freelancers
                <br />
                will take it from here
              </h1>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="mb-6 relative">
                <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-lg max-w-3xl">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder="Search for any service..."
                    className="flex-1 px-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none text-lg"
                  />
                  <button
                    type="submit"
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 my-1 mr-1 rounded-md transition-colors flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Search Results Dropdown */}
                {showResults && filteredGigs.length > 0 && (
                  <div
                    ref={resultsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto z-50 max-w-3xl transition-all duration-300 ease-in-out opacity-100 transform translate-y-0"
                  >
                    <div className="p-2">
                      {searchQuery.trim() ? (
                        <div className="text-xs text-gray-500 px-3 py-2 font-semibold">
                          Found {filteredGigs.length} {filteredGigs.length === 1 ? 'gig' : 'gigs'}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 px-3 py-2 font-semibold">
                          Popular Gigs
                        </div>
                      )}
                      {filteredGigs.map((gig) => (
                        <button
                          key={gig.uid}
                          onClick={() => handleGigClick(gig)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-md transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{gig.gig_name}</div>
                          <div className="text-sm text-gray-500 mt-1">{gig.gig_address}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              gig.gig_tag === 'REAL_ESTATE' ? 'bg-blue-100 text-blue-800' :
                              gig.gig_tag === 'VOLUNTEERING' ? 'bg-green-100 text-green-800' :
                              gig.gig_tag === 'INFRASTRUCTURE' ? 'bg-orange-100 text-orange-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {gig.gig_tag}
                            </span>
                            {gig.paid === 1 && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                Paid
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              gig.gig_urgency === 'HIGH' ? 'bg-red-100 text-red-800' :
                              gig.gig_urgency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {gig.gig_urgency}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isLoadingGigs && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl p-4 max-w-3xl z-50 transition-all duration-300 ease-in-out opacity-100 transform translate-y-0">
                    <div className="text-center text-gray-500">Loading gigs...</div>
                  </div>
                )}

                {/* No Results */}
                {showResults && searchQuery.trim() && filteredGigs.length === 0 && !isLoadingGigs && allGigs.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl p-4 max-w-3xl z-50 transition-all duration-300 ease-in-out opacity-100 transform translate-y-0">
                    <div className="text-center text-gray-500">No gigs found matching "{searchQuery}"</div>
                  </div>
                )}
              </form>

              {/* Suggested Services Tags */}
              <div className="flex flex-nowrap gap-2 mb-8 overflow-x-auto">
                {suggestedServices.map((service, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(service);
                      navigate(`/job-map?search=${encodeURIComponent(service)}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-300/20 hover:bg-green-500/30 text-white rounded-full text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    {service}
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>

              {/* CTA Button */}
              <div className="mt-6">
                <Link
                  to="/job-map"
                  className="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Section: Trusted By & Video Controls */}
          <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/20">
            {/* Trusted By Section */}
            <div className="flex items-center gap-4">
              <span className="text-white/80 text-sm font-light">Trusted by:</span>
              <div className="flex items-center gap-6 opacity-70">
                {/* Placeholder logos - you can replace with actual logo images */}
                <span className="text-white text-sm font-light">American Airlines</span>
                <span className="text-white text-sm font-light">Black Enterprise</span>
                <span className="text-white text-sm font-light">Toyota</span>
                <span className="text-white text-sm font-light">Verizon</span>
                <span className="text-white text-sm font-light">Fidelity</span>
                <span className="text-white text-sm font-light">McDonalds</span>
                <span className="text-white text-sm font-light">Nascar</span>
                <span className="text-white text-sm font-light">Pepsico</span>
                <span className="text-white text-sm font-light">Nationwide</span>
              </div>
            </div>

            {/* Video Play/Pause Button */}
            <button
              onClick={toggleVideo}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/80 hover:bg-gray-700/90 text-white transition-colors"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </section>

      <ViewTopReports />
      <PricingSection showNavAndFooter={false} />
      <Footer />
      <Chatbot />
    </>
  );
}

