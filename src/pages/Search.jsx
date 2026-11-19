import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapIcon, MapPin, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { useApp } from '../context/AppContext';
import { apiRequest } from '../api/client';

const availabilityCutoff = Date.now() - 24 * 60 * 60 * 1000;

export default function Search() {
  const [searchParams] = useSearchParams();
  const { filters, properties, apiStatus, setFilters, resetFilters } = useApp();
  const [remoteProperties, setRemoteProperties] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [sortOrder, setSortOrder] = useState(filters.sortBy || 'relevance');
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const listRef = useRef(null);

  // Sync URL params to filters on initial mount
  useEffect(() => {
    const city = searchParams.get('city') || '';
    const search = searchParams.get('q') || city;
    const listingType = searchParams.get('type') || filters.listingType;
    if (city || search || listingType !== filters.listingType) {
      setFilters({ city, search, listingType });
    }
  }, [searchParams, setFilters, filters.listingType]);

  // Simulated loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters, sortOrder]);

  useEffect(() => {
    if (apiStatus !== 'online') {
      return undefined;
    }

    const params = new URLSearchParams({
      listingType: filters.listingType || '',
      search: filters.city || filters.search || '',
      propertyType: filters.propertyType || '',
      bedrooms: filters.bedrooms || '',
      minPrice: filters.priceMin || '',
      maxPrice: filters.priceMax || '',
      verifiedOnly: String(filters.verifiedOnly),
      availableToday: String(filters.availableToday),
      ownerVerified: String(filters.ownerVerified),
      documentsChecked: String(filters.documentsChecked),
      sort: sortOrder,
    });
    let active = true;
    apiRequest(`/properties?${params}`)
      .then(({ items }) => {
        if (active) {
          setRemoteProperties(items);
          setSearchError('');
        }
      })
      .catch((error) => {
        if (active) {
          setRemoteProperties([]);
          setSearchError(`Could not load search results: ${error.message}`);
        }
      });
    return () => { active = false; };
  }, [apiStatus, filters, sortOrder]);

  // Apply filters and sorting
  const filteredProperties = useMemo(() => {
    if (apiStatus === 'online') return remoteProperties || [];

    let result = properties.filter(p => {
      // Location matching (very basic for mock)
      const locationQuery = (filters.city || filters.search || '').trim().toLowerCase();
      if (locationQuery) {
        const query = locationQuery;
        const matchLocation = 
          p.city?.toLowerCase().includes(query) || 
          p.locality?.toLowerCase().includes(query) || 
          p.title?.toLowerCase().includes(query);
        if (!matchLocation) return false;
      }
      
      // Listing type
      if (filters.listingType && p.listingType !== filters.listingType) return false;
      
      // Property type
      if (filters.propertyType && p.propertyType !== filters.propertyType) return false;
      
      // Bedrooms
      if (filters.bedrooms && p.bedrooms !== filters.bedrooms) return false;
      
      // Price range
      if (filters.priceMin && p.price < Number(filters.priceMin)) return false;
      if (filters.priceMax && p.price > Number(filters.priceMax)) return false;
      
      // Toggle filters
      if (filters.verifiedOnly && p.trustScore.total < 70) return false;
      
      if (filters.availableToday) {
        const isAvailable = p.availabilityStatus === 'available';
        const availabilityDate = p.verification.availabilityVerified?.date;
        const recentAvailability = availabilityDate
          && new Date(availabilityDate).getTime() > availabilityCutoff;
        if (!isAvailable || !recentAvailability) return false;
      }
      
      if (filters.ownerVerified && !p.owner?.verified) return false;
      
      if (filters.documentsChecked && !(p.verification.documentsReviewed?.checked > 0)) return false;
      
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.lastVerifiedAt || 0) - new Date(a.lastVerifiedAt || 0);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'trust-score':
          return b.trustScore.total - a.trustScore.total;
        case 'relevance':
        default:
          return b.trustScore.total - a.trustScore.total;
      }
    });

    return result;
  }, [apiStatus, filters, properties, remoteProperties, sortOrder]);

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      <Navbar />
      
      {/* Top Search & Filter Bar */}
      <div className="bg-white border-b border-slate-200 z-10 shadow-sm">
        <div className="px-4 py-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-4">
            <SearchBar variant="compact" />
            <FilterBar />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel: Property List */}
        <div 
          ref={listRef}
          className={`flex-1 overflow-y-auto w-full lg:w-[55%] lg:max-w-4xl p-4 sm:p-6 transition-transform duration-300 ${showMobileMap ? '-translate-x-full absolute' : 'translate-x-0 relative z-10'} lg:translate-x-0 lg:static bg-slate-50`}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-slate-800">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
            </h1>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-slate-500 font-medium hidden sm:block">Sort by:</label>
              <select 
                id="sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="text-sm border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white py-2 pl-3 pr-8"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest Verified</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="trust-score">Highest Trust Score</option>
              </select>
            </div>
          </div>

          {searchError && (
            <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {searchError}
            </p>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <LoadingState key={i} type="card" />)}
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 lg:pb-6">
              {filteredProperties.map(property => (
                <div 
                  key={property.id} 
                  id={`property-card-${property.id}`}
                  onMouseEnter={() => setHoveredPropertyId(property.id)}
                  onMouseLeave={() => setHoveredPropertyId(null)}
                  className={`transition-all duration-200 rounded-xl ${hoveredPropertyId === property.id ? 'ring-2 ring-indigo-500 shadow-lg' : ''}`}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No exact matches found" 
              description="Try adjusting your filters, expanding your search area, or removing some requirements."
              actionLabel="Clear all filters"
              onAction={resetFilters}
            />
          )}
        </div>

        {/* Right Panel: Map */}
        <div className={`fixed inset-0 z-20 bg-slate-100 lg:static lg:flex-1 lg:w-[45%] lg:block transition-transform duration-300 ${showMobileMap ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}`}>
          {showMobileMap && (
            <button 
              onClick={() => setShowMobileMap(false)}
              className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-full shadow-lg text-slate-800 lg:hidden"
            >
              <X size={24} />
            </button>
          )}
          <PropertyMap 
            properties={filteredProperties} 
            selectedId={hoveredPropertyId}
            onMarkerClick={(id) => {
              setHoveredPropertyId(id);
              if (showMobileMap) setShowMobileMap(false);
              const el = document.getElementById(`property-card-${id}`);
              if (el && listRef.current) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
          />
        </div>

        {/* Mobile Map Toggle */}
        <button 
          onClick={() => setShowMobileMap(!showMobileMap)}
          className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-indigo-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-semibold hover:bg-indigo-800 transition-colors"
        >
          {showMobileMap ? (
            <>
              <MapPin size={20} />
              <span>Show List</span>
            </>
          ) : (
            <>
              <MapIcon size={20} />
              <span>Map View</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
