import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, MapPin, Share2, Heart, Flag, CheckCircle2,
  AlertTriangle, ShieldCheck,
  Car, Zap, Shield, Dumbbell, Waves, Trees, Wifi, Droplets, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ImageGallery from '../components/ImageGallery';
import TrustScore from '../components/TrustScore';
import TrustScoreBreakdown from '../components/TrustScoreBreakdown';
import VerificationBadge from '../components/VerificationBadge';
import VerificationTimeline from '../components/VerificationTimeline';
import DocumentTable from '../components/DocumentTable';
import PropertyMap from '../components/PropertyMap';
import PropertyCard from '../components/PropertyCard';
import ReportModal from '../components/ReportModal';
import { useApp } from '../context/AppContext';
import { formatFullPrice, formatArea, getBHKLabel, getPricePerSqFt } from '../utils/formatters';
import { getTimeSince, getAvailabilityStatus } from '../utils/verification';

const getAmenityIcon = (amenity) => {
  const normalized = amenity.toLowerCase();
  if (normalized.includes('parking')) return <Car className="w-5 h-5" />;
  if (normalized.includes('power backup')) return <Zap className="w-5 h-5" />;
  if (normalized.includes('security')) return <Shield className="w-5 h-5" />;
  if (normalized.includes('gym')) return <Dumbbell className="w-5 h-5" />;
  if (normalized.includes('pool')) return <Waves className="w-5 h-5" />;
  if (normalized.includes('park') || normalized.includes('garden')) return <Trees className="w-5 h-5" />;
  if (normalized.includes('wifi') || normalized.includes('internet')) return <Wifi className="w-5 h-5" />;
  if (normalized.includes('water')) return <Droplets className="w-5 h-5" />;
  return <CheckCircle2 className="w-5 h-5" />;
};

const PropertyDetail = () => {
  const { id } = useParams();
  const { properties, toggleSaveProperty, isPropertySaved } = useApp();
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const property = properties.find((item) => item.id === id);

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Property Not Found</h2>
          <p className="text-slate-600 mb-6 text-center">The property you are looking for might have been removed or is temporarily unavailable.</p>
          <Link to="/" className="px-6 py-2 bg-indigo-900 text-white rounded-md hover:bg-indigo-800 transition-colors inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const similarProperties = properties
    .filter((item) => item.city === property.city && item.id !== property.id)
    .slice(0, 3);

  const saved = isPropertySaved(property.id);
  const availability = getAvailabilityStatus(property.availabilityStatus);
  
  const documents = property.verification?.documentsReviewed?.items || [];
  const verifiedDocsCount = documents.filter(
    (document) => document.status === 'reviewed' || document.status === 'verified',
  ).length;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleContactOwner = () => {
    toast.success("Contact request sent. The owner will reach out to you shortly.");
  };

  const handleScheduleVisit = () => {
    toast.success("Visit request submitted. You'll receive confirmation soon.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Navbar />
      
      <main className="flex-grow">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm text-slate-500 whitespace-nowrap overflow-x-auto pb-2 scrollbar-hide">
            <Link to="/" className="hover:text-indigo-900">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
            <Link to={`/?city=${property.city}`} className="hover:text-indigo-900">{property.city}</Link>
            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
            <span className="text-slate-900 font-medium truncate">{property.title}</span>
          </nav>
        </div>

        {/* Image Gallery */}
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 mb-6">
          <ImageGallery images={property.images} />
        </div>

        {/* Title Bar - Desktop */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{property.title}</h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    availability.label === 'Available' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {availability.label === 'Available' && <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-1.5 animate-pulse"></span>}
                    {availability.label}
                  </span>
                </div>
                <div className="flex items-center text-slate-600 text-sm mb-4">
                  <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                  {property.locality}, {property.city}
                </div>
                
                {/* Detail Chips */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-md font-medium">{getBHKLabel(property.bedrooms)}</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-md font-medium">{formatArea(property.area)}</span>
                  {property.floor != null && <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-md font-medium">Floor {property.floor}</span>}
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-md font-medium">{property.facing} Facing</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-md font-medium">{property.furnishing}</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-md font-medium">{property.age} old</span>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end w-full md:w-auto">
                <div className="text-3xl font-bold text-slate-900 mb-1">{formatFullPrice(property.price)}</div>
                <div className="text-sm text-slate-500 mb-4">{getPricePerSqFt(property.price, property.area)}</div>
                
                <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                  <TrustScore score={property.trustScore?.total || 0} size="md" />
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleSaveProperty(property.id)}
                      className={`p-2 rounded-full border ${saved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} transition-colors group relative`}
                      title="Save Property"
                    >
                      <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                      onClick={handleShare}
                      className="p-2 rounded-full border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors group relative"
                      title="Share"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setIsReportModalOpen(true)}
                      className="p-2 rounded-full border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors group relative"
                      title="Report Issue"
                    >
                      <Flag className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column (60%) */}
            <div className="w-full lg:w-[60%] space-y-8">
              
              {/* Trust & Verification Panel - HIGH VISIBILITY */}
              <section id="trust-panel" className="bg-white rounded-xl shadow-md border-t-4 border-t-teal-600 border-x-slate-200 border-b-slate-200 border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-teal-600" />
                    <h2 className="text-xl font-bold text-slate-900">Trust & Verification</h2>
                  </div>
                  <TrustScore score={property.trustScore?.total || 0} size="lg" />
                </div>
                
                <div className="p-6">
                  {/* Quick Verification Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="mt-0.5">
                        <VerificationBadge status={property.verification.propertyExists?.status} label={property.verification.propertyExists?.status || 'Not checked'} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Property Existence</div>
                        <div className="text-xs text-slate-500">{property.verification.propertyExists?.method || 'Physical inspection'} • {getTimeSince(property.verification.propertyExists?.date)}{property.verification.propertyExists?.verifier ? ` • ${property.verification.propertyExists.verifier}` : ''}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="mt-0.5">
                        <VerificationBadge status={property.verification.locationVerified?.status} label={property.verification.locationVerified?.status || 'Not checked'} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Location</div>
                        <div className="text-xs text-slate-500">{property.verification.locationVerified?.method || 'Location check'} • {getTimeSince(property.verification.locationVerified?.date)}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="mt-0.5">
                        <VerificationBadge status={property.verification.availabilityVerified?.status} label={property.verification.availabilityVerified?.status || 'Not checked'} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Availability</div>
                        <div className="text-xs text-slate-500">Confirmed • {getTimeSince(property.verification.availabilityVerified?.date)}{property.verification.availabilityVerified?.confirmedBy ? ` • by ${property.verification.availabilityVerified.confirmedBy}` : ''}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="mt-0.5">
                        <VerificationBadge status={property.verification.ownerVerified?.status} label={property.verification.ownerVerified?.status || 'Not checked'} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Lister Identity</div>
                        <div className="text-xs text-slate-500">{property.verification.ownerVerified?.method || 'Identity check'} • {getTimeSince(property.verification.ownerVerified?.date)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="mt-0.5">
                        <VerificationBadge status={property.verification.photosVerified?.status} label={property.verification.photosVerified?.status || 'Not checked'} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Photos & Media</div>
                        <div className="text-xs text-slate-500">{property.verification.photosVerified?.capturedBy || 'Photo review'} • {property.verification.photosVerified?.count || property.images?.length || 0} items</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="mt-0.5">
                        <VerificationBadge status={verifiedDocsCount === documents.length && documents.length > 0 ? 'verified' : 'pending'} label={verifiedDocsCount === documents.length && documents.length > 0 ? 'reviewed' : 'in progress'} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Documents</div>
                        <div className="text-xs text-slate-500">{verifiedDocsCount} of {documents.length} reviewed</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Score Breakdown</h3>
                    <TrustScoreBreakdown breakdown={property.trustScore?.breakdown} />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Verification Timeline</h3>
                    <VerificationTimeline history={property.verificationHistory} />
                  </div>
                </div>
              </section>

              {/* Description */}
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Description</h2>
                <div className="prose prose-slate max-w-none text-slate-600">
                  {property.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </section>

              {/* Amenities */}
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities?.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-indigo-600">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{amenity}</span>
                    </div>
                  ))}
                  {(!property.amenities || property.amenities.length === 0) && (
                    <p className="text-slate-500 col-span-full">No amenities listed.</p>
                  )}
                </div>
              </section>

              {/* Document Verification */}
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900">Document Checks</h2>
                  <span className="text-sm font-medium bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                    {verifiedDocsCount} of {documents.length} verified
                  </span>
                </div>
                <div className="p-6">
                  <DocumentTable documents={documents} />
                  
                  <div className="mt-6 flex gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                    <p>
                      <strong>Disclaimer:</strong> Document review by Niwas does not by itself constitute a legal title guarantee. Buyers should obtain appropriate professional legal advice before completing a transaction.
                    </p>
                  </div>
                </div>
              </section>

            </div>
            
            {/* Right Column (40%) */}
            <div className="w-full lg:w-[40%] space-y-6">
              <div className="sticky top-24 space-y-6">
                
                {/* Contact Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold text-xl uppercase overflow-hidden">
                      {property.owner?.avatar ? (
                        <img src={property.owner.avatar} alt={property.owner.name} className="w-full h-full object-cover" />
                      ) : (
                        property.owner?.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{property.owner?.name || 'Contact'}</h3>
                        {property.verification.ownerVerified?.status === 'verified' && (
                          <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase tracking-wide">
                          {property.owner?.type || 'Owner'}
                        </span>
                        {property.owner?.responseRate && (
                          <span className="text-xs text-slate-500 border-l border-slate-300 pl-2">
                            {property.owner.responseRate} response rate
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-center p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-medium">
                      {property.owner?.phone
                        ? property.owner.phone
                        : '+91 98*** ***10'}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={handleContactOwner}
                      className="w-full py-3 bg-indigo-900 text-white rounded-lg font-semibold hover:bg-indigo-800 transition-colors shadow-sm"
                    >
                      Contact {property.owner?.type || 'Owner'}
                    </button>
                    <button 
                      onClick={handleScheduleVisit}
                      className="w-full py-3 bg-white text-indigo-900 border border-indigo-900 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                    >
                      Schedule Visit
                    </button>
                  </div>
                </div>

                {/* Location Map */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Location</h2>
                  <div className="h-64 rounded-lg overflow-hidden border border-slate-200 mb-3">
                    <PropertyMap properties={[property]} center={[property.latitude, property.longitude]} zoom={15} />
                  </div>
                  <p className="text-sm text-slate-600 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{property.address || `${property.locality}, ${property.city}`}</span>
                  </p>
                </div>

                {/* Report Section */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-700 block">Something doesn't look right?</span>
                    Help us keep Niwas safe.
                  </div>
                  <button 
                    onClick={() => setIsReportModalOpen(true)}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4 text-slate-400" />
                    Report
                  </button>
                </div>

              </div>
            </div>
            
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Similar Properties in {property.city}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map(similarProp => (
                <PropertyCard key={similarProp.id} property={similarProp} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex gap-3 lg:hidden z-40">
        <button 
          onClick={handleContactOwner}
          className="flex-1 py-3 bg-indigo-900 text-white rounded-lg font-semibold hover:bg-indigo-800 transition-colors"
        >
          Contact
        </button>
        <button 
          onClick={() => toggleSaveProperty(property.id)}
          className={`p-3 rounded-lg border ${saved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-300 text-slate-700'} flex items-center justify-center`}
        >
          <Heart className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        propertyId={property.id} 
      />
    </div>
  );
};

export default PropertyDetail;
