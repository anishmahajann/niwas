import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyTypes, cities, allAmenities } from '../data/properties';
import Navbar from '../components/Navbar';
import PropertyMap from '../components/PropertyMap';
import { useApp } from '../context/AppContext';
import { uploadFiles, apiRequest } from '../api/client';
import { Upload, Camera, FileText, MapPin, User, Home, Check, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const steps = [
  { id: 1, name: 'Property Info', icon: Home },
  { id: 2, name: 'Location', icon: MapPin },
  { id: 3, name: 'Photos', icon: Camera },
  { id: 4, name: 'Owner Info', icon: User },
  { id: 5, name: 'Documents', icon: FileText },
  { id: 6, name: 'Review', icon: Check },
];

const cityCoordinates = {
  Chandigarh: [30.7333, 76.7794],
  Mohali: [30.7046, 76.7179],
  Panchkula: [30.6942, 76.8606],
  Jalandhar: [31.326, 75.5762],
  'Delhi NCR': [28.6139, 77.209],
  Noida: [28.5355, 77.391],
  Gurgaon: [28.4595, 77.0266],
  Bangalore: [12.9716, 77.5946],
  Mumbai: [19.076, 72.8777],
  Zirakpur: [30.6425, 76.8173],
};

export default function PostProperty() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { addToast, user, openAuthDialog } = useApp();
  
  const [formData, setFormData] = useState({
    listingType: 'Buy',
    propertyType: '',
    bhk: '',
    area: '',
    price: '',
    title: '',
    description: '',
    amenities: [],
    city: '',
    locality: '',
    address: '',
    latitude: '',
    longitude: '',
    photos: [],
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    isOwner: 'Yes',
    documents: [],
    uploadedDocuments: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'amenities') {
        setFormData(prev => ({
          ...prev,
          amenities: checked 
            ? [...prev.amenities, value]
            : prev.amenities.filter(a => a !== value)
        }));
      } else if (name === 'documents') {
         setFormData(prev => ({
          ...prev,
          documents: checked 
            ? [...prev.documents, value]
            : prev.documents.filter(d => d !== value)
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMapPick = ({ lat, lng }) => {
    setFormData((previous) => ({
      ...previous,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
  };

  const selectedPosition = formData.latitude && formData.longitude
    ? [Number(formData.latitude), Number(formData.longitude)]
    : null;
  const mapCenter = selectedPosition || cityCoordinates[formData.city] || [30.7333, 76.7794];

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleUpload = async (event, endpoint, field, limit) => {
    const remaining = limit - formData[field].length;
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = '';
    if (remaining <= 0) {
      addToast(`You can upload up to ${limit} files.`, 'error');
      return;
    }
    const files = selectedFiles.slice(0, remaining);
    if (!files.length) return;
    if (!user) {
      addToast('Sign in before uploading property files.', 'error');
      openAuthDialog();
      return;
    }

    setIsUploading(true);
    try {
      const { files: uploaded } = await uploadFiles(endpoint, files);
      setFormData((previous) => ({ ...previous, [field]: [...previous[field], ...uploaded] }));
      addToast(`${uploaded.length} file${uploaded.length === 1 ? '' : 's'} uploaded.`);
    } catch (error) {
      addToast(`Upload failed: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = [
      ['title', 'Property title'],
      ['price', 'Price'],
      ['city', 'City'],
      ['locality', 'Locality'],
      ['propertyType', 'Property type'],
      ['ownerName', 'Your name'],
      ['ownerPhone', 'Phone number'],
    ];
    const missingFields = requiredFields
      .filter(([field]) => !formData[field].trim())
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      addToast(`Please complete the required fields: ${missingFields.join(', ')}.`, 'error');
      return;
    }

    if (!Number.isFinite(Number(formData.price)) || Number(formData.price) <= 0) {
      addToast('Enter a valid property price.', 'error');
      return;
    }

    if (!user) {
      addToast('Sign in before submitting a property.', 'error');
      openAuthDialog();
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('/properties', {
        method: 'POST',
        body: JSON.stringify({
          listingType: formData.listingType.toLowerCase(),
          propertyType: formData.propertyType,
          bedrooms: Number.parseInt(formData.bhk, 10) || undefined,
          area: Number(formData.area) || undefined,
          price: Number(formData.price),
          title: formData.title,
          description: formData.description,
          amenities: formData.amenities,
          city: formData.city,
          locality: formData.locality,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          images: formData.photos.map((file) => file.url),
          documents: formData.uploadedDocuments,
          ownerPhone: formData.ownerPhone,
          ownerType: formData.isOwner === 'Yes' ? 'Owner' : 'Broker',
        }),
      });
      setIsSubmitted(true);
    } catch (error) {
      addToast(`Could not submit property: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
        listingType: 'Buy', propertyType: '', bhk: '', area: '', price: '', title: '', description: '',
        amenities: [], city: '', locality: '', address: '', latitude: '', longitude: '', photos: [], ownerName: '', ownerPhone: '',
        ownerEmail: '', isOwner: 'Yes', documents: [], uploadedDocuments: [],
    });
    setCurrentStep(1);
    setIsSubmitted(false);
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Property Submitted Successfully!</h2>
            <p className="text-slate-600 mb-6">Your property is now in the verification queue.</p>
            
            <div className="bg-amber-50 rounded-lg p-4 mb-8 border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-1">Verification Timeline</h3>
              <p className="text-sm text-amber-800">Expected completion within 48-72 hours.</p>
              <p className="text-sm text-amber-800 mt-2">You'll receive updates at <span className="font-medium">{formData.ownerEmail || 'your email'}</span>.</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/search')}
                className="w-full py-3 px-4 bg-[#1e3a5f] text-white rounded-lg font-medium hover:bg-[#152a46] transition-colors flex items-center justify-center gap-2"
              >
                View My Listings <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={resetForm}
                className="w-full py-3 px-4 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Submit Another Property
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">Post Your Property</h1>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 -z-10"></div>
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-teal-600 -z-10 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div 
                    onClick={() => { if(isCompleted) setCurrentStep(step.id); }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted ? 'cursor-pointer bg-teal-600 border-teal-600 text-white' : 
                      isActive ? 'bg-white border-teal-600 text-teal-600' : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium mt-2 hidden md:block ${isActive ? 'text-teal-700' : 'text-slate-500'}`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8">
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <Home className="text-teal-600" /> Property Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Listing Type</label>
                    <div className="flex gap-4">
                      {['Buy', 'Rent', 'Commercial'].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="listingType" value={type} checked={formData.listingType === type} onChange={handleChange} className="text-teal-600 focus:ring-teal-500" />
                          <span className="text-slate-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Property Type *</label>
                      <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full rounded-lg border-slate-300 p-2.5 border focus:border-teal-500 focus:ring-teal-500">
                        <option value="">Select Type</option>
                        {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">BHK *</label>
                       <div className="flex gap-2">
                           {['1', '2', '3', '4', '5+'].map(bhk => (
                               <label key={bhk} className={`flex-1 text-center py-2 border rounded-lg cursor-pointer transition-colors ${formData.bhk === bhk ? 'bg-teal-50 border-teal-600 text-teal-700 font-medium' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                                   <input type="radio" name="bhk" value={bhk} checked={formData.bhk === bhk} onChange={handleChange} className="sr-only"/>
                                   {bhk}
                               </label>
                           ))}
                       </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Area (sq ft) *</label>
                        <input type="number" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. 1200" className="w-full rounded-lg border-slate-300 p-2.5 border focus:border-teal-500 focus:ring-teal-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹) *</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="e.g. 5000000" className="w-full rounded-lg border-slate-300 p-2.5 border focus:border-teal-500 focus:ring-teal-500" />
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Property Title *</label>
                     <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Beautiful 2BHK in South Delhi" className="w-full rounded-lg border-slate-300 p-2.5 border focus:border-teal-500 focus:ring-teal-500" />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                     <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Describe your property..." className="w-full rounded-lg border-slate-300 p-2.5 border focus:border-teal-500 focus:ring-teal-500"></textarea>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Amenities</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {allAmenities.map(amenity => (
                              <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" name="amenities" value={amenity} checked={formData.amenities.includes(amenity)} onChange={handleChange} className="rounded text-teal-600 focus:ring-teal-500" />
                                  <span className="text-sm text-slate-700">{amenity}</span>
                              </label>
                          ))}
                      </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                 <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin className="text-teal-600" /> Location Details
                </h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800"><strong>Note:</strong> Our team will verify the location via GPS during physical inspection to ensure trust and transparency.</p>
                </div>

                <div className="space-y-4">
                     <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                      <select name="city" value={formData.city} onChange={handleChange} className="w-full rounded-lg border-slate-300 p-2.5 border focus:border-teal-500 focus:ring-teal-500">
                        <option value="">Select City</option>
                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>

                    <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Locality / Area *</label>
                     <input type="text" name="locality" value={formData.locality} onChange={handleChange} placeholder="e.g. Vasant Kunj" className="w-full rounded-lg border-slate-300 p-2.5 border focus:border-teal-500 focus:ring-teal-500" />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                     <textarea name="address" value={formData.address} onChange={handleChange} rows="3" placeholder="Enter complete address..." className="w-full rounded-lg border-slate-300 p-2.5 border focus:border-teal-500 focus:ring-teal-500"></textarea>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Pin the approximate property location</p>
                    <div className="h-72 rounded-lg overflow-hidden border border-slate-200">
                      <PropertyMap
                        properties={[]}
                        center={mapCenter}
                        zoom={selectedPosition ? 15 : 12}
                        selectedPosition={selectedPosition}
                        onMapClick={handleMapPick}
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {selectedPosition
                        ? `Selected coordinates: ${formData.latitude}, ${formData.longitude}`
                        : 'Choose a city, then click the map to set a pin.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <Camera className="text-teal-600" /> Property Photos
                </h2>
                
                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Camera className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800"><strong>Note:</strong> Our verification team will also capture independent photos during inspection to provide a genuine view to buyers.</p>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors flex flex-col items-center">
                    <Upload className="w-12 h-12 text-slate-400 mb-3" />
                    <p className="text-lg font-medium text-slate-700 mb-1">Add photos of your property</p>
                    <p className="text-sm text-slate-500">JPG, PNG, or WebP · up to 12 images, 10 MB each</p>
                    <label className="mt-4 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium cursor-pointer">
                      {isUploading ? 'Uploading…' : 'Browse Files'}
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={isUploading} className="sr-only" onChange={(event) => handleUpload(event, '/uploads/images', 'photos', 12)} />
                    </label>
                </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {formData.photos.map((photo, index) => (
                        <div key={photo.url} className="aspect-square rounded-lg border border-slate-200 overflow-hidden relative group">
                            <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
                            <button type="button" aria-label={`Remove ${photo.name}`} onClick={() => setFormData((previous) => ({ ...previous, photos: previous.photos.filter((_, photoIndex) => photoIndex !== index) }))} className="absolute inset-x-0 bottom-0 bg-black/60 py-2 text-sm font-medium text-white opacity-0 group-hover:opacity-100 focus:opacity-100">Remove</button>
                        </div>
                    ))}
                 </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <User className="text-teal-600" /> Owner Information
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800"><strong>Note:</strong> Identity verification will be required before your listing is published to ensure safety for all users.</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Are you the owner?</label>
                    <div className="flex gap-4">
                      {['Yes', 'No, I am a broker'].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="isOwner" value={type} checked={formData.isOwner === type} onChange={handleChange} className="text-teal-600 focus:ring-teal-500" />
                          <span className="text-slate-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
                     <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Full Name" className="w-full rounded-lg border-slate-300 p-2.5 border focus:border-teal-500 focus:ring-teal-500" />
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                        <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="w-full rounded-lg border-slate-300 p-2.5 border focus:border-teal-500 focus:ring-teal-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleChange} placeholder="email@example.com" className="w-full rounded-lg border-slate-300 p-2.5 border focus:border-teal-500 focus:ring-teal-500" />
                      </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <FileText className="text-teal-600" /> Documents
                </h2>

                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Check className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-teal-900">
                        <p className="mb-1"><strong>Document submission is optional but significantly improves your Trust Score.</strong></p>
                        <p>All documents are securely stored and only verification results are shown publicly.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700 mb-2">Upload property documents (PDF, JPG, PNG, or WebP · max 15 MB each):</p>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <Upload className="h-4 w-4" /> {isUploading ? 'Uploading…' : 'Choose documents'}
                      <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" multiple disabled={isUploading} className="sr-only" onChange={(event) => handleUpload(event, '/uploads/documents', 'uploadedDocuments', 8)} />
                    </label>
                    {formData.uploadedDocuments.map((document, index) => (
                      <div key={document.url} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
                        <span className="truncate text-slate-700">{document.name}</span>
                        <button type="button" onClick={() => setFormData((previous) => ({ ...previous, uploadedDocuments: previous.uploadedDocuments.filter((_, documentIndex) => documentIndex !== index) }))} className="ml-3 text-red-600 hover:text-red-800">Remove</button>
                      </div>
                    ))}
                </div>
               </div>
            )}

            {currentStep === 6 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <Check className="text-teal-600" /> Review & Submit
                </h2>
                
                 <div className="bg-[#1e3a5f]/10 border border-[#1e3a5f]/20 rounded-lg p-5 mb-6">
                    <h3 className="text-lg font-bold text-[#1e3a5f] mb-3">Verification Process</h3>
                    <p className="text-sm text-slate-700 mb-3">After submission, your property will enter our verification queue. A Niwas verification team member will:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 mb-4 ml-2">
                        <li>Verify property existence and location</li>
                        <li>Capture independent photos</li>
                        <li>Verify your identity</li>
                        <li>Review submitted documents</li>
                    </ol>
                    <p className="text-sm font-medium text-teal-700 flex items-center gap-2">
                         <Check className="w-4 h-4" /> Your listing will receive a Trust Verified badge once verification is complete.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Summary Blocks */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 relative">
                        <button onClick={() => setCurrentStep(1)} className="absolute top-4 right-4 text-sm text-teal-600 hover:text-teal-800 font-medium">Edit</button>
                        <h4 className="font-semibold text-slate-900 mb-3 border-b pb-2 flex items-center gap-2"><Home className="w-4 h-4"/> Property Info</h4>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <span className="text-slate-500">Type:</span><span className="font-medium">{formData.listingType} - {formData.propertyType || '-'}</span>
                            <span className="text-slate-500">BHK:</span><span className="font-medium">{formData.bhk || '-'}</span>
                            <span className="text-slate-500">Area:</span><span className="font-medium">{formData.area ? `${formData.area} sq ft` : '-'}</span>
                            <span className="text-slate-500">Price:</span><span className="font-medium">{formData.price ? `₹${formData.price}` : '-'}</span>
                            <span className="text-slate-500">Title:</span><span className="font-medium truncate">{formData.title || '-'}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 relative">
                         <button onClick={() => setCurrentStep(2)} className="absolute top-4 right-4 text-sm text-teal-600 hover:text-teal-800 font-medium">Edit</button>
                        <h4 className="font-semibold text-slate-900 mb-3 border-b pb-2 flex items-center gap-2"><MapPin className="w-4 h-4"/> Location</h4>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <span className="text-slate-500">City:</span><span className="font-medium">{formData.city || '-'}</span>
                            <span className="text-slate-500">Locality:</span><span className="font-medium">{formData.locality || '-'}</span>
                        </div>
                    </div>

                     <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 relative">
                         <button onClick={() => setCurrentStep(4)} className="absolute top-4 right-4 text-sm text-teal-600 hover:text-teal-800 font-medium">Edit</button>
                        <h4 className="font-semibold text-slate-900 mb-3 border-b pb-2 flex items-center gap-2"><User className="w-4 h-4"/> Owner Info</h4>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                             <span className="text-slate-500">Role:</span><span className="font-medium">{formData.isOwner}</span>
                            <span className="text-slate-500">Name:</span><span className="font-medium">{formData.ownerName || '-'}</span>
                            <span className="text-slate-500">Phone:</span><span className="font-medium">{formData.ownerPhone || '-'}</span>
                        </div>
                    </div>
                </div>
                </div>
            )}
          </div>

          {/* Form Navigation Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-200 bg-white border border-slate-300'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || isUploading}
                className="flex items-center gap-2 px-8 py-2.5 bg-[#1e3a5f] text-white rounded-lg font-medium hover:bg-[#152a46] transition-colors shadow-md text-lg"
              >
                {isSubmitting ? 'Submitting…' : 'Submit Property'} <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
