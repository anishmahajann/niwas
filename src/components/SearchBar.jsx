import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function SearchBar({ large = false, onSearch }) {
  const navigate = useNavigate();
  const { filters, setFilters } = useApp();
  const tab = filters.listingType || 'buy';
  const query = filters.search || filters.city || '';

  const tabs = [
    { id: 'buy', label: 'Buy' },
    { id: 'rent', label: 'Rent' },
    { id: 'commercial', label: 'Commercial' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setFilters({ listingType: tab, city: query, search: query });
    if (onSearch) {
      onSearch(query, tab);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className={`search-widget w-full overflow-hidden rounded-xl border border-slate-200 bg-white ${large ? 'mx-auto max-w-4xl' : ''}`}>
      <div className="flex border-b border-slate-100 bg-slate-50/80">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`min-h-11 flex-1 px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
              tab === id ? 'border-b-2 border-teal-700 bg-white text-teal-900' : 'text-slate-500 hover:bg-white hover:text-slate-800'
            }`}
            onClick={() => setFilters({ listingType: id })}
          >
            {label}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2 sm:flex-row sm:items-center sm:p-2.5">
        <div className="relative min-w-0 flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className={`block h-12 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-700/10 ${
              large ? 'text-base sm:text-[17px]' : 'text-sm'
            }`}
            placeholder="City, locality, landmark or project"
            value={query}
            onChange={(e) => setFilters({ city: e.target.value, search: e.target.value })}
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#12383b] px-6 text-sm font-semibold text-white transition hover:bg-[#1b5554] focus:outline-none focus:ring-4 focus:ring-teal-800/20 sm:px-7"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </form>
    </div>
  );
}
