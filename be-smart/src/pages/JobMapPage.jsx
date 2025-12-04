import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Chatbot from "../components/chatbot/chatbot";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getAllGigs } from "../middlewares/gigs";
import { useUser } from "../components/global-context/context_provider";
import jsPDF from "jspdf";

mapboxgl.accessToken =
  "pk.eyJ1Ijoibm9pcmVtIiwiYSI6ImNtaHBweDk1ZDBucGUybHBxMXcxeGM1YWMifQ.zcbLzPvxUSkLx8vR9s7FrQ";

const jobs = [
  { 
    index: 1,
    title: "City Hall - Data Entry", 
    address: "300 W Washington St, Greensboro, NC",
    pay: "$18/hour",
    payType: "hourly",
    contactPerson: "Sarah Johnson",
    contactTitle: "HR Coordinator",
    contactPhone: "(336) 373-2000",
    contactEmail: "sarah.johnson@greensboro-nc.gov",
    company: "City of Greensboro",
    tags: ["data-entry", "office", "government", "entry-level", "administrative", "computer-skills"]
  },
  { 
    index: 2,
    title: "Downtown Cleanup", 
    address: "200 N Elm St, Greensboro, NC",
    pay: "$16/hour",
    payType: "hourly",
    contactPerson: "Michael Chen",
    contactTitle: "Operations Manager",
    contactPhone: "(336) 373-2100",
    contactEmail: "mchen@greensboro-nc.gov",
    company: "City of Greensboro Public Works",
    tags: ["cleaning", "outdoor", "physical-labor", "entry-level", "maintenance", "community-service"]
  },
  { 
    index: 3,
    title: "Recycling Center Assistant", 
    address: "401 Patton Ave, Greensboro, NC",
    pay: "$17.50/hour",
    payType: "hourly",
    contactPerson: "Patricia Williams",
    contactTitle: "Facility Supervisor",
    contactPhone: "(336) 373-2400",
    contactEmail: "pwilliams@greensboro-nc.gov",
    company: "Greensboro Recycling Center",
    tags: ["recycling", "environmental", "facility-operations", "entry-level", "sustainability", "physical-labor"]
  },
  { 
    index: 4,
    title: "Park Maintenance", 
    address: "1500 Yanceyville St, Greensboro, NC",
    pay: "$19/hour",
    payType: "hourly",
    contactPerson: "Robert Martinez",
    contactTitle: "Parks Supervisor",
    contactPhone: "(336) 373-2500",
    contactEmail: "rmartinez@greensboro-nc.gov",
    company: "Greensboro Parks & Recreation",
    tags: ["park-maintenance", "outdoor", "landscaping", "mid-level", "maintenance", "horticulture"]
  },
  { 
    index: 5,
    title: "Community Center Helper", 
    address: "1001 S Eugene St, Greensboro, NC",
    pay: "$15.50/hour",
    payType: "hourly",
    contactPerson: "Lisa Anderson",
    contactTitle: "Program Director",
    contactPhone: "(336) 373-2600",
    contactEmail: "landerson@greensboro-nc.gov",
    company: "Greensboro Community Centers",
    tags: ["community-service", "youth-programs", "event-coordination", "entry-level", "social-work", "customer-service"]
  },
  { 
    index: 6,
    title: "Library Assistant", 
    address: "219 N Church St, Greensboro, NC",
    pay: "$17/hour",
    payType: "hourly",
    contactPerson: "Jennifer Davis",
    contactTitle: "Library Manager",
    contactPhone: "(336) 373-2700",
    contactEmail: "jdavis@greensboro-nc.gov",
    company: "Greensboro Public Library",
    tags: ["library", "education", "customer-service", "entry-level", "books", "public-service"]
  },
  { 
    index: 7,
    title: "Warehouse Worker", 
    address: "500 E Market St, Greensboro, NC",
    pay: "$16.50/hour",
    payType: "hourly",
    contactPerson: "David Thompson",
    contactTitle: "Warehouse Manager",
    contactPhone: "(336) 373-2800",
    contactEmail: "dthompson@greensboro-nc.gov",
    company: "Greensboro Distribution Center",
    tags: ["warehouse", "logistics", "physical-labor", "entry-level", "inventory", "shipping"]
  },
  { 
    index: 8,
    title: "Street Sweeper Operator", 
    address: "300 S Elm St, Greensboro, NC",
    pay: "$18.50/hour",
    payType: "hourly",
    contactPerson: "Maria Rodriguez",
    contactTitle: "Street Maintenance Supervisor",
    contactPhone: "(336) 373-2900",
    contactEmail: "mrodriguez@greensboro-nc.gov",
    company: "City of Greensboro Public Works",
    tags: ["street-maintenance", "equipment-operation", "outdoor", "mid-level", "driving", "sanitation"]
  },
];

export default function JobMapPage() {
  const { user } = useUser();
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [jobsWithCoords, setJobsWithCoords] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [contractDate, setContractDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Static coordinates for known addresses (fallback)
  const staticCoords = {
    "300 W Washington St, Greensboro, NC": [-79.792, 36.071],
    "200 N Elm St, Greensboro, NC": [-79.791, 36.073],
    "401 Patton Ave, Greensboro, NC": [-79.800, 36.075],
    "1500 Yanceyville St, Greensboro, NC": [-79.776, 36.087],
    "1001 S Eugene St, Greensboro, NC": [-79.800, 36.058],
    "219 N Church St, Greensboro, NC": [-79.790, 36.073],
    "500 E Market St, Greensboro, NC": [-79.788, 36.072],
    "300 S Elm St, Greensboro, NC": [-79.791, 36.070],
  };

  // Geocode address using Mapbox Geocoding API
  const geocodeAddress = async (address) => {
    // First check static coords
    if (staticCoords[address]) {
      return staticCoords[address];
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return [lng, lat];
      }
    } catch (error) {
      console.error(`Error geocoding address "${address}":`, error);
    }
    
    // Default to Greensboro center if geocoding fails
    return [-79.792, 36.0726];
  };

  // Convert API gig to job format
  const convertGigToJob = (gig, index = 0) => {
    // Get additional info from localStorage if available
    const additionalInfo = localStorage.getItem(`gig_${gig.uid}`);
    let extraInfo = {};
    if (additionalInfo) {
      try {
        extraInfo = JSON.parse(additionalInfo);
      } catch (e) {
        console.error('Error parsing additional info:', e);
      }
    }

    // Map gig_tag to tags array
    const tagMap = {
      'REAL_ESTATE': ['real-estate', 'property', 'housing'],
      'VOLUNTEERING': ['volunteer', 'community-service', 'non-profit'],
      'INFRASTRUCTURE': ['infrastructure', 'construction', 'maintenance', 'public-works'],
      'HOSPITALITY': ['hospitality', 'customer-service', 'retail', 'service-industry']
    };

    return {
      index: index + 1000, // Start API jobs at 1000+ to avoid conflicts with hardcoded jobs
      title: gig.gig_name,
      address: gig.gig_address,
      pay: extraInfo.payRate || (gig.paid ? 'Paid' : 'Unpaid'),
      payType: extraInfo.payType || 'hourly',
      contactPerson: extraInfo.contactPerson || 'Contact information not provided',
      contactTitle: extraInfo.contactTitle || '',
      contactPhone: extraInfo.contactPhone || 'N/A',
      contactEmail: extraInfo.contactEmail || 'N/A',
      company: extraInfo.company || 'Not specified',
      uid: gig.uid, // Store uid for identification
      tags: extraInfo.tags || tagMap[gig.gig_tag] || ['general']
    };
  };

  // Calculate relevance score for "cleanup" search
  const calculateCleanupRelevance = (job) => {
    let score = 0;
    const titleLower = job.title.toLowerCase();
    const tagsLower = job.tags?.map(tag => tag.toLowerCase()) || [];
    const companyLower = job.company?.toLowerCase() || '';
    
    // Exact match in title gets highest score
    if (titleLower.includes('cleanup')) score += 100;
    if (titleLower.includes('clean')) score += 50;
    
    // Tags related to cleanup
    if (tagsLower.includes('cleaning')) score += 80;
    if (tagsLower.includes('cleanup')) score += 90;
    if (tagsLower.includes('sanitation')) score += 70;
    if (tagsLower.includes('maintenance')) score += 60;
    if (tagsLower.includes('outdoor')) score += 30;
    if (tagsLower.includes('physical-labor')) score += 20;
    if (tagsLower.includes('community-service')) score += 15;
    
    // Company name relevance
    if (companyLower.includes('clean')) score += 40;
    if (companyLower.includes('public works')) score += 30;
    if (companyLower.includes('maintenance')) score += 25;
    
    // Partial matches
    if (titleLower.includes('sweep')) score += 60;
    if (titleLower.includes('recycling')) score += 40;
    if (titleLower.includes('park')) score += 30;
    
    return score;
  };

  // Handle search with hard-coded ordering for "cleaning" and "cleanup"
  const handleSearch = async (query) => {
    setSearchQuery(query);
    const queryLower = query.toLowerCase().trim();
    
    // If searching for "cleaning", show loading and reorder
    if (queryLower === 'cleaning') {
      setIsSearching(true);
      
      // Wait 2-3 seconds (random between 2000-3000ms)
      const delay = Math.random() * 1000 + 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Hard-coded order for cleaning-related jobs
      // Priority order: jobs with "cleaning" tag, then "sanitation", then "maintenance", then others
      const cleaningOrder = [
        "Downtown Cleanup", // Has "cleaning" tag
        "Street Sweeper Operator", // Has "sanitation" tag
        "Park Maintenance", // Has "maintenance" tag
        "Recycling Center Assistant", // Related to cleaning/environmental
        "Warehouse Worker", // May involve cleaning
        "Community Center Helper", // May involve cleaning
        "Library Assistant", // May involve cleaning
        "City Hall - Data Entry", // Not related
      ];
      
      // Reorder jobs based on hard-coded order
      const reorderedJobs = [...allJobs].sort((a, b) => {
        const indexA = cleaningOrder.findIndex(title => a.title === title);
        const indexB = cleaningOrder.findIndex(title => b.title === title);
        
        // If both found in order, sort by order
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        // If only A found, A comes first
        if (indexA !== -1) return -1;
        // If only B found, B comes first
        if (indexB !== -1) return 1;
        // If neither found, maintain original order
        return 0;
      });
      
      setFilteredJobs(reorderedJobs);
      setIsSearching(false);
    } else if (queryLower === 'cleanup') {
      // If searching for "cleanup", reorder by relevance
      setIsSearching(true);
      
      // Wait 2-3 seconds (random between 2000-3000ms)
      const delay = Math.random() * 1000 + 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Reorder jobs by relevance to "cleanup"
      const reorderedJobs = [...allJobs].sort((a, b) => {
        const scoreA = calculateCleanupRelevance(a);
        const scoreB = calculateCleanupRelevance(b);
        return scoreB - scoreA; // Higher score first
      });
      
      setFilteredJobs(reorderedJobs);
      setIsSearching(false);
    } else if (query.trim() === '') {
      // If search is empty, show all jobs
      setIsSearching(false);
      setFilteredJobs(allJobs);
    } else {
      // For other searches, do normal filtering
      setIsSearching(false);
      const filtered = allJobs.filter(job => 
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company?.toLowerCase().includes(query.toLowerCase()) ||
        job.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        job.address?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  };

  // Handle Enter key press in search input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  // Handle accepting a job
  const handleAcceptJob = (job) => {
    if (!user) {
      alert('Please log in to accept a job');
      return;
    }
    setSelectedJob(job);
    setShowAcceptModal(true);
    // Set default start date to one week from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setStartDate(nextWeek.toISOString().split('T')[0]);
  };

  // Generate and download contract
  const generateContract = () => {
    if (!selectedJob || !user) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('WORK AGREEMENT CONTRACT', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Contract Date
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Contract Date: ${contractDate}`, margin, yPosition);
    yPosition += 10;

    // Parties Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('PARTIES', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Service Provider (Contractor):', margin, yPosition);
    yPosition += 7;
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${user.name || user.username || 'N/A'}`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`Email: ${user.email || 'N/A'}`, margin + 5, yPosition);
    yPosition += 6;
    if (user.phone) {
      doc.text(`Phone: ${user.phone}`, margin + 5, yPosition);
      yPosition += 6;
    }
    yPosition += 5;

    doc.setFont(undefined, 'bold');
    doc.text('Client (Employer):', margin, yPosition);
    yPosition += 7;
    doc.setFont(undefined, 'normal');
    doc.text(`Company: ${selectedJob.company || 'N/A'}`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`Contact: ${selectedJob.contactPerson}`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`Title: ${selectedJob.contactTitle || 'N/A'}`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`Phone: ${selectedJob.contactPhone}`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`Email: ${selectedJob.contactEmail || 'N/A'}`, margin + 5, yPosition);
    yPosition += 10;

    // Job Details
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('JOB DETAILS', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Job Title: ${selectedJob.title}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Job Location: ${selectedJob.address}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Compensation: ${selectedJob.pay}`, margin, yPosition);
    yPosition += 7;
    if (startDate) {
      doc.text(`Start Date: ${startDate}`, margin, yPosition);
      yPosition += 7;
    }
    yPosition += 5;

    // Terms and Conditions
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('TERMS AND CONDITIONS', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const terms = [
      '1. The Contractor agrees to provide services as described in the Job Details section.',
      '2. Compensation will be paid according to the agreed rate: ' + selectedJob.pay + '.',
      '3. The Contractor is responsible for completing the work in a timely and professional manner.',
      '4. The Client agrees to provide necessary information and access required for job completion.',
      '5. Either party may terminate this agreement with 7 days written notice.',
      '6. This agreement is binding upon both parties and their respective successors.',
      '7. Any disputes arising from this agreement shall be resolved through mediation.',
      '8. The Contractor is responsible for their own taxes and insurance.',
      '9. This contract is valid from the contract date until job completion or termination.',
      '10. Both parties acknowledge they have read and understood all terms of this agreement.'
    ];

    terms.forEach(term => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = margin;
      }
      const lines = doc.splitTextToSize(term, pageWidth - 2 * margin);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 5 + 2;
    });

    yPosition += 10;

    // Signatures
    if (yPosition > 240) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('SIGNATURES', margin, yPosition);
    yPosition += 15;

    // Contractor Signature
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Contractor (Service Provider):', margin, yPosition);
    yPosition += 15;
    doc.setFont(undefined, 'normal');
    doc.text('_________________________', margin, yPosition);
    yPosition += 6;
    doc.text(`${user.name || user.username || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Date: ${contractDate}`, margin, yPosition);
    yPosition += 15;

    // Client Signature
    doc.setFont(undefined, 'bold');
    doc.text('Client (Employer):', margin, yPosition);
    yPosition += 15;
    doc.setFont(undefined, 'normal');
    doc.text('_________________________', margin, yPosition);
    yPosition += 6;
    doc.text(`${selectedJob.contactPerson}`, margin, yPosition);
    yPosition += 6;
    doc.text(`${selectedJob.company}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Date: _______________`, margin, yPosition);

    // Contract ID
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    const contractId = `CONTRACT-${selectedJob.index}-${Date.now()}`;
    doc.text(`Contract ID: ${contractId}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });

    // Download the PDF
    const fileName = `Job_Contract_${selectedJob.title.replace(/\s+/g, '_')}_${contractDate}.pdf`;
    doc.save(fileName);

    // Close modal
    setShowAcceptModal(false);
    alert('Contract generated and downloaded successfully!');
  };

  // Load jobs from API
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      try {
        // Get gigs from API
        const apiGigs = await getAllGigs();
        
        // Convert API gigs to job format with index
        const apiJobs = apiGigs.map((gig, idx) => convertGigToJob(gig, idx));
        
        // Merge with hardcoded jobs (avoid duplicates by checking title and address)
        const hardcodedJobs = jobs.map(job => ({ ...job, isHardcoded: true }));
        const mergedJobs = [...hardcodedJobs];
        
        // Add API jobs that don't already exist
        apiJobs.forEach(apiJob => {
          const exists = mergedJobs.some(
            job => job.title === apiJob.title && job.address === apiJob.address
          );
          if (!exists) {
            mergedJobs.push(apiJob);
          }
        });
        
        setAllJobs(mergedJobs);
        setFilteredJobs(mergedJobs);
      } catch (error) {
        console.error('Error loading gigs:', error);
        // Fallback to hardcoded jobs if API fails
        const fallbackJobs = jobs.map(job => ({ ...job, isHardcoded: true }));
        setAllJobs(fallbackJobs);
        setFilteredJobs(fallbackJobs);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to add markers to map
  const addMarkersToMap = async (map) => {
    if (!map || allJobs.length === 0) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add 3D buildings layer if it doesn't exist
    if (!map.getLayer("add-3d-buildings")) {
      try {
        map.addLayer({
          id: "add-3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "min_height"],
            "fill-extrusion-opacity": 0.6,
          },
        });
      } catch (err) {
        console.warn("Could not add 3D buildings layer:", err);
      }
    }

    // Add markers for all jobs
    const mappedJobs = [];
    
    for (const job of allJobs) {
      // Geocode address
      const coords = await geocodeAddress(job.address);
      if (!coords) continue;

      const markerEl = document.createElement("div");
      markerEl.className =
        "bg-green-500 rounded-full w-4 h-4 border-2 border-white shadow-lg cursor-pointer";

      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '200px';
      popupContent.innerHTML = `
        <h3 class="font-semibold text-gray-900 mb-2" style="font-size: 16px; margin-bottom: 8px;">${job.title}</h3>
        <div style="margin-bottom: 8px;">
          <p class="text-gray-700 text-sm mb-1" style="margin-bottom: 4px;">
            <strong>Company:</strong> ${job.company || 'N/A'}
          </p>
          <p class="text-gray-700 text-sm mb-1" style="margin-bottom: 4px;">
            <strong>Pay:</strong> <span style="color: #16a34a; font-weight: 600;">${job.pay}</span>
          </p>
        </div>
        <div style="margin-bottom: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
          <p class="text-gray-600 text-xs mb-1" style="margin-bottom: 4px; font-size: 12px;">
            <strong>Contact:</strong> ${job.contactPerson}
          </p>
          <p class="text-gray-600 text-xs mb-1" style="margin-bottom: 4px; font-size: 12px;">
            ${job.contactTitle || ''}
          </p>
          <p class="text-gray-600 text-xs" style="font-size: 12px;">
            ${job.contactPhone}
          </p>
        </div>
        <p class="text-gray-500 text-xs mt-2" style="margin-top: 8px; font-size: 11px;">
          ${job.address}
        </p>
        <button class="accept-job-btn" data-job-index="${job.index}" style="width: 100%; margin-top: 12px; padding: 8px; background-color: #16a34a; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
          Accept Job
        </button>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent);
      
      // Add click handler for accept button after popup is opened
      popup.on('open', () => {
        const acceptBtn = popupContent.querySelector('.accept-job-btn');
        if (acceptBtn) {
          acceptBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleAcceptJob(job);
          });
        }
      });

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      mappedJobs.push({ ...job, coords });
    }

    setJobsWithCoords(mappedJobs);
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    let map;
    try {
      // Initialize Mapbox map
      map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-79.792, 36.0726],
        zoom: 12,
        pitch: 50,
        bearing: -17.6,
        antialias: true,
      });

      mapRef.current = map;

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add markers when style is loaded
      map.on("style.load", () => {
        if (!isLoading && allJobs.length > 0) {
          addMarkersToMap(map);
        }
      });

      // Handle map load errors
      map.on("error", (e) => {
        console.error("Map error:", e);
      });
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }

    // Cleanup function
    return () => {
      // Remove all markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      
      // Remove map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add markers when jobs are loaded
  useEffect(() => {
    if (!isLoading && allJobs.length > 0 && mapRef.current) {
      const map = mapRef.current;
      if (map.loaded()) {
        addMarkersToMap(map);
      } else {
        map.once('load', () => {
          addMarkersToMap(map);
        });
      }
    }
  }, [isLoading, allJobs]);

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-64px)] w-full">
        {/* Left side: Map */}
        <div className="w-[70%] h-full relative">
          <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '100%' }} />
        </div>

        {/* Right side: Scrollable Job List */}
        <div className="w-[30%] bg-white overflow-y-auto border-l border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Available Jobs
            </h2>

            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  // Do normal filtering while typing, but don't trigger special "cleanup" reordering
                  if (value.toLowerCase().trim() === 'cleanup') {
                    // Just show normal filtered results while typing
                    const filtered = allJobs.filter(job => 
                      job.title.toLowerCase().includes('cleanup') ||
                      job.company?.toLowerCase().includes('cleanup') ||
                      job.tags?.some(tag => tag.toLowerCase().includes('cleanup')) ||
                      job.address?.toLowerCase().includes('cleanup')
                    );
                    setFilteredJobs(filtered);
                    setIsSearching(false);
                  } else {
                    handleSearch(value);
                  }
                }}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* AI Thinking Loading State */}
            {isSearching && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-blue-700 font-medium">AI is thinking...</p>
                </div>
                <p className="text-blue-600 text-sm mt-2 text-center">
                  Analyzing and ranking results for you
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading jobs...</p>
              </div>
            ) : isSearching ? (
              // Skeleton loading placeholders that slide up
              <div className="space-y-4">
                {[1, 2, 3, 4].map((placeholder, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    style={{
                      animation: `slideUp 0.3s ease-out ${index * 0.05}s`,
                      animationFillMode: 'both'
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                      </div>
                      <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                    <div className="flex gap-1 mb-2">
                      <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                      <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                      <div className="h-5 bg-gray-200 rounded w-14 animate-pulse"></div>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/5 animate-pulse"></div>
                    </div>
                    <div className="h-10 bg-gray-300 rounded mt-3 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job, index) => (
                  <div
                    key={job.uid || `job-${index}`}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-gray-50 hover:bg-white"
                    onClick={() => {
                      const jobWithCoords = jobsWithCoords.find(
                        (j) => j.title === job.title && j.address === job.address
                      );
                      if (jobWithCoords && jobWithCoords.coords && mapRef.current) {
                        mapRef.current.flyTo({
                          center: jobWithCoords.coords,
                          zoom: 16,
                          speed: 1.2,
                          curve: 1.2,
                          essential: true,
                        });
                      }
                    }}
                  >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      {job.index && (
                        <span className="text-xs text-gray-400">#{job.index}</span>
                      )}
                    </div>
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      {job.pay}
                    </span>
                  </div>
                  
                  {job.company && (
                    <p className="text-sm text-gray-500 mb-2">
                      {job.company}
                    </p>
                  )}

                  {/* Tags */}
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {job.tags.map((tag, tagIdx) => (
                        <span
                          key={tagIdx}
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mb-3 space-y-2">
                    <div className="flex items-start">
                      <svg
                        className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">{job.address}</span>
                    </div>

                    <div className="flex items-start">
                      <svg
                        className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{job.contactPerson}</p>
                        <p className="text-xs text-gray-500">{job.contactTitle}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <svg
                        className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">{job.contactPhone}</span>
                    </div>
                  </div>

                  {/* Accept Job Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptJob(job);
                    }}
                    className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    Accept Job
                  </button>
                </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accept Job Modal */}
      {showAcceptModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Accept Job</h2>
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Job Title:</strong> {selectedJob.title}</p>
                    <p><strong>Company:</strong> {selectedJob.company}</p>
                    <p><strong>Location:</strong> {selectedJob.address}</p>
                    <p><strong>Pay:</strong> {selectedJob.pay}</p>
                    <p><strong>Contact:</strong> {selectedJob.contactPerson}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Date
                  </label>
                  <input
                    type="date"
                    value={contractDate}
                    onChange={(e) => setContractDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> By accepting this job, you agree to the terms and conditions 
                    that will be included in the contract. The contract will include your information, 
                    job details, compensation, and standard work agreement terms.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowAcceptModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateContract}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    Generate & Download Contract
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
    </>
  );
}
