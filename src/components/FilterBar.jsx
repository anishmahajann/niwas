import React from 'react';
import { useApp } from '../context/AppContext';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { propertyTypes } from '../data/properties';

export default function FilterBar() {
  const { filters, setFilters, resetFilters } = useApp();

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const handleToggle = (key) => {
    setFilters({ [key]: !filters[key] });
  };

  const buyBudgets = [
    { label: 'Under ₹25L', minPrice: '', maxPrice: '2500000' },
    { label: '₹25-50L', minPrice: '2500000', maxPrice: '5000000' },
    { label: '₹50L-1Cr', minPrice: '5000000', maxPrice: '10000000' },
    { label: '₹1-2Cr', minPrice: '10000000', maxPrice: '20000000' },
    { label: '₹2-5Cr', minPrice: '20000000', maxPrice: '50000000' },
    { label: '₹5Cr+', minPrice: '50000000', maxPrice: '' },
  ];

  const rentBudgets = [
    { label: 'Under ₹10K', minPrice: '', maxPrice: '10000' },
    { label: '₹10-20K', minPrice: '10000', maxPrice: '20000' },
    { label: '₹20-50K', minPrice: '20000', maxPrice: '50000' },
    { label: '₹50K+', minPrice: '50000', maxPrice: '' },
  ];

  const isRent = filters.listingType === 'rent';
  const budgets = isRent ? rentBudgets : buyBudgets;

  const handleBudgetChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setFilters({ priceMin: '', priceMax: '' });
    } else {
      const [min, max] = val.split('-');
      setFilters({
        priceMin: min || '',
        priceMax: max || '',
      });
    }
  };

  const currentBudgetValue = (filters.priceMin || filters.priceMax)
    ? `${filters.priceMin || ''}-${filters.priceMax || ''}`
    : '';

  const bhks = [1, 2, 3, 4, 5];

  return (
    <div className="bg-white border-b border-border shadow-sm p-4 mb-6">
      <div className="max-w-7xl mx-auto flex flex-col space-y-4">
        <div className="flex items-center space-x-2 text-text font-medium pb-2 border-b border-border sm:hidden">
          <SlidersHorizontal className="h-5 w-5" />
          <span>Filters</span>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <select
            className="border border-border rounded-md px-3 py-2 text-sm bg-surface focus:ring-primary focus:border-primary outline-none"
            value={filters.listingType || 'buy'}
            onChange={(e) => handleFilterChange('listingType', e.target.value)}
          >
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
            <option value="commercial">Commercial</option>
          </select>

          <select
            className="border border-border rounded-md px-3 py-2 text-sm bg-surface focus:ring-primary focus:border-primary outline-none"
            value={currentBudgetValue}
            onChange={handleBudgetChange}
          >
            <option value="">Budget</option>
            {budgets.map((b) => (
              <option key={b.label} value={`${b.minPrice}-${b.maxPrice}`}>
                {b.label}
              </option>
            ))}
          </select>

          <select
            className="border border-border rounded-md px-3 py-2 text-sm bg-surface focus:ring-primary focus:border-primary outline-none"
            value={filters.propertyType || ''}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
          >
            <option value="">Property Type</option>
            {propertyTypes.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>

          <select
            className="border border-border rounded-md px-3 py-2 text-sm bg-surface focus:ring-primary focus:border-primary outline-none"
            value={filters.bedrooms || ''}
            onChange={(e) => {
              const val = e.target.value;
              handleFilterChange('bedrooms', val ? Number(val) : '');
            }}
          >
            <option value="">BHK</option>
            {bhks.map((b) => (
              <option key={b} value={b}>
                {b} BHK
              </option>
            ))}
          </select>

          <div className="h-6 w-px bg-border hidden sm:block mx-2"></div>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded text-primary focus:ring-primary border-border"
              checked={!!filters.verifiedOnly}
              onChange={() => handleToggle('verifiedOnly')}
            />
            <span className="text-sm font-medium text-text">Verified Only</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded text-primary focus:ring-primary border-border"
              checked={!!filters.availableToday}
              onChange={() => handleToggle('availableToday')}
            />
            <span className="text-sm font-medium text-text">Available Today</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded text-primary focus:ring-primary border-border"
              checked={!!filters.ownerVerified}
              onChange={() => handleToggle('ownerVerified')}
            />
            <span className="text-sm font-medium text-text">Owner Verified</span>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded text-primary focus:ring-primary border-border"
              checked={!!filters.documentsChecked}
              onChange={() => handleToggle('documentsChecked')}
            />
            <span className="text-sm font-medium text-text">Docs Checked</span>
          </label>

          <div className="flex-grow"></div>
          
          <button 
            onClick={resetFilters}
            className="flex items-center text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
