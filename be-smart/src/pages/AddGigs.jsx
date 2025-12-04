import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/chatbot/chatbot';
import { addGig } from '../middlewares/gigs';
import { useUser } from '../components/global-context/context_provider';

export default function AddGigs() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    gigName: '',
    category: '',
    company: '',
    gigType: '',
    location: '',
    duration: '',
    payRate: '',
    description: '',
    positions: 1,
    availability: '',
    startDate: '',
    endDate: '',
    contactPerson: '',
    contactTitle: '',
    contactPhone: '',
    contactEmail: '',
  });

  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setImages(prev => [...prev, ...files]);
  };

  // Map category to gig_tag
  const mapCategoryToTag = (category) => {
    const categoryMap = {
      'tech': 'INFRASTRUCTURE',
      'construction': 'INFRASTRUCTURE',
      'retail': 'HOSPITALITY',
      'hospitality': 'HOSPITALITY',
      'education': 'VOLUNTEERING',
      'other': 'VOLUNTEERING'
    };
    return categoryMap[category] || 'VOLUNTEERING';
  };

  // Map availability to urgency
  const mapAvailabilityToUrgency = (availability) => {
    const urgencyMap = {
      'available': 'LOW',
      'limited': 'MEDIUM',
      'unavailable': 'HIGH'
    };
    return urgencyMap[availability] || 'LOW';
  };

  const handleSubmit = async (e, action) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate required fields
    if (!formData.gigName || !formData.location || !formData.category) {
      setError('Please fill in all required fields (Gig Name, Location, Category)');
      return;
    }

    // Check if user is logged in
    if (!user || !user.uid) {
      setError('Please log in to create a gig');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare gig data for API
      const gigData = {
        gig_owner: user.uid,
        gig_name: formData.gigName,
        gig_address: formData.location,
        paid: !!formData.payRate && parseFloat(formData.payRate) > 0,
        gig_description: formData.description || 'No description provided',
        gig_tag: mapCategoryToTag(formData.category),
        gig_urgency: mapAvailabilityToUrgency(formData.availability),
      };

      // Generate tags based on category and other fields
      const generateTags = () => {
        const tags = [];
        const categoryTags = {
          'tech': ['technology', 'computer', 'software', 'IT'],
          'construction': ['construction', 'building', 'physical-labor', 'skilled-trade'],
          'retail': ['retail', 'customer-service', 'sales', 'commerce'],
          'hospitality': ['hospitality', 'customer-service', 'service-industry', 'tourism'],
          'education': ['education', 'teaching', 'learning', 'academic'],
          'other': ['general', 'miscellaneous']
        };
        
        tags.push(...(categoryTags[formData.category] || ['general']));
        
        if (formData.gigType) {
          tags.push(formData.gigType.toLowerCase().replace('-', '-'));
        }
        
        // Add experience level based on availability
        if (formData.availability === 'available') {
          tags.push('entry-level');
        } else if (formData.availability === 'limited') {
          tags.push('mid-level');
        }
        
        return tags;
      };

      // Store additional info in localStorage for JobMapPage
      const additionalInfo = {
        company: formData.company || 'Not specified',
        payRate: formData.payRate ? `$${formData.payRate}/hour` : 'Not specified',
        payType: 'hourly',
        contactPerson: formData.contactPerson || 'Contact information not provided',
        contactTitle: formData.contactTitle || '',
        contactPhone: formData.contactPhone || 'N/A',
        contactEmail: formData.contactEmail || 'N/A',
        gigName: formData.gigName,
        address: formData.location,
        tags: generateTags(),
        hoursPerWeek: formData.duration ? parseInt(formData.duration) : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        requirements: formData.description ? [formData.description] : [],
        description: formData.description || 'No description provided',
        experienceLevel: formData.availability === 'available' ? 'entry-level' : 
                        formData.availability === 'limited' ? 'mid-level' : 'entry-level',
        workType: formData.gigType || 'part-time'
      };

      if (action === 'publish') {
        // Submit to API
        const result = await addGig(gigData);
        
        if (result) {
          // Store additional info with the gig UID as key
          localStorage.setItem(`gig_${result.uid}`, JSON.stringify(additionalInfo));
          
          setSuccess(true);
          // Redirect to job map after 1.5 seconds
          setTimeout(() => {
            navigate('/job-map');
          }, 1500);
        } else {
          setError('Failed to create gig. Please try again.');
        }
      } else {
        // Draft - save to localStorage
        const draftKey = `gig_draft_${Date.now()}`;
        localStorage.setItem(draftKey, JSON.stringify({ ...gigData, ...additionalInfo }));
        setSuccess(true);
        alert('Draft saved!');
      }
    } catch (err) {
      console.error('Error submitting gig:', err);
      setError('An error occurred while creating the gig. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-gray-700">Home</Link></li>
              <li>/</li>
              <li className="text-gray-900">Add Gig</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Gig</h1>

          <form onSubmit={(e) => handleSubmit(e, 'publish')}>
            {/* Gig Description Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Gig Description</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gig Name */}
                <div>
                  <label htmlFor="gigName" className="block text-sm font-medium text-gray-700 mb-2">
                    Gig Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="gigName"
                    name="gigName"
                    value={formData.gigName}
                    onChange={handleChange}
                    placeholder="Enter gig name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    <option value="tech">Technology</option>
                    <option value="construction">Construction</option>
                    <option value="retail">Retail</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Company/Organization */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Enter company or organization name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Gig Type */}
                <div>
                  <label htmlFor="gigType" className="block text-sm font-medium text-gray-700 mb-2">
                    Gig Type
                  </label>
                  <select
                    id="gigType"
                    name="gigType"
                    value={formData.gigType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select gig type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location (Address) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., 123 Main St, Greensboro, NC"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="Enter duration"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Pay Rate */}
                <div>
                  <label htmlFor="payRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Rate ($/hour)
                  </label>
                  <input
                    type="number"
                    id="payRate"
                    name="payRate"
                    value={formData.payRate}
                    onChange={handleChange}
                    placeholder="Enter pay rate per hour"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Person */}
                  <div>
                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person Name
                    </label>
                    <input
                      type="text"
                      id="contactPerson"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Contact Title */}
                  <div>
                    <label htmlFor="contactTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Title/Role
                    </label>
                    <input
                      type="text"
                      id="contactTitle"
                      name="contactTitle"
                      value={formData.contactTitle}
                      onChange={handleChange}
                      placeholder="HR Manager"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="(336) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="contact@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Receipt Info (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Pricing & Availability Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing & Availability</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Number of Positions */}
                <div>
                  <label htmlFor="positions" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Positions
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, positions: Math.max(1, prev.positions - 1) }))}
                      className="px-3 py-2 border border-gray-300 rounded-l-md hover:bg-gray-50 focus:outline-none"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="positions"
                      name="positions"
                      value={formData.positions}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, positions: prev.positions + 1 }))}
                      className="px-3 py-2 border border-gray-300 rounded-r-md hover:bg-gray-50 focus:outline-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Availability Status */}
                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                    Availability Status
                  </label>
                  <select
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a Availability</option>
                    <option value="available">Available</option>
                    <option value="limited">Limited</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Gig Images Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Gig Images</h2>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-green-400 transition-colors"
              >
                <input
                  type="file"
                  id="imageUpload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </label>
              </div>

              {/* Display uploaded images */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">Gig created successfully! Redirecting to job map...</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Draft
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Gig'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
      <Chatbot />
    </>
  );
}

