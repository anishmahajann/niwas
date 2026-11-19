import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import ComparisonTable from '../components/ComparisonTable';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { useApp } from '../context/AppContext';

export default function SavedProperties() {
  const { properties, savedProperties, removeSavedProperty, propertyNotes, updatePropertyNote, addToast } = useApp();
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [propertyToRemove, setPropertyToRemove] = useState(null);

  const savedProps = properties.filter((p) => savedProperties.includes(p.id));

  const handleToggleCompare = (id) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((pid) => pid !== id));
    } else {
      if (selectedForCompare.length < 5) {
        setSelectedForCompare([...selectedForCompare, id]);
      } else {
        addToast('You can compare up to 5 properties at a time.', 'error');
      }
    }
  };

  const handleRemove = (id) => {
    setPropertyToRemove(id);
  };

  const confirmRemove = () => {
    removeSavedProperty(propertyToRemove);
    setSelectedForCompare(selectedForCompare.filter((id) => id !== propertyToRemove));
    setPropertyToRemove(null);
    addToast('Property removed from saved list.');
  };

  const handleCompareClick = () => {
    if (selectedForCompare.length >= 2 && selectedForCompare.length <= 5) {
      setShowComparison(true);
    } else {
        addToast('Select between 2 and 5 properties to compare.', 'error');
    }
  };

  if (showComparison) {
    const compareProps = properties.filter((p) => selectedForCompare.includes(p.id));
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Property Comparison</h1>
            <button
              onClick={() => setShowComparison(false)}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-medium"
            >
              Back to Saved
            </button>
          </div>
          <ComparisonTable
            properties={compareProps}
            onRemove={(id) => {
              const remaining = selectedForCompare.filter((propertyId) => propertyId !== id);
              setSelectedForCompare(remaining);
              if (remaining.length < 2) setShowComparison(false);
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Saved Properties</h1>
            <p className="text-slate-500 mt-1">{savedProps.length} properties saved</p>
          </div>
          {savedProps.length > 0 && (
            <button
              onClick={handleCompareClick}
              disabled={selectedForCompare.length < 2}
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                selectedForCompare.length >= 2
                  ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Compare Selected ({selectedForCompare.length})
            </button>
          )}
        </div>

        {savedProps.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-slate-200">
            <EmptyState
              icon="Heart"
              title="No saved properties yet"
              description="Start browsing to save properties you're interested in."
              action={
                <Link
                  to="/search"
                  className="inline-flex items-center px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a46] font-medium transition-colors mt-4"
                >
                  Browse Properties
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProps.map((property) => (
              <div key={property.id} className="flex flex-col gap-3">
                <div className="relative">
                  <div className="absolute top-4 left-4 z-10 bg-white rounded-full shadow-md">
                    <label className="flex items-center p-2 cursor-pointer rounded-full hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedForCompare.includes(property.id)}
                        onChange={() => handleToggleCompare(property.id)}
                        className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                      />
                      <span className="ml-2 text-sm font-medium text-slate-700 pr-2">Compare</span>
                    </label>
                  </div>
                  <PropertyCard property={property} />
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col gap-3">
                  <div>
                    <label htmlFor={`notes-${property.id}`} className="block text-sm font-medium text-slate-700 mb-1">
                      Personal Notes
                    </label>
                    <textarea
                      id={`notes-${property.id}`}
                      rows="2"
                      className="w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                      placeholder="Add your thoughts about this property..."
                      value={propertyNotes?.[property.id] || ''}
                      onChange={(e) => updatePropertyNote(property.id, e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => handleRemove(property.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium self-end transition-colors"
                  >
                    Remove from Saved
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmDialog
          isOpen={propertyToRemove !== null}
          onClose={() => setPropertyToRemove(null)}
          onConfirm={confirmRemove}
          title="Remove Property"
          message="Are you sure you want to remove this property from your saved list? Your personal notes will be deleted."
          confirmText="Remove"
          type="danger"
        />
      </main>
      <Footer />
    </div>
  );
}
