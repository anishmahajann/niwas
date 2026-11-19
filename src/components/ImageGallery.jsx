import React, { useState } from 'react';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGallery({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unavailableImages, setUnavailableImages] = useState({});

  const markImageUnavailable = (index) => {
    setUnavailableImages((previous) => ({ ...previous, [index]: true }));
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-surface rounded-xl flex items-center justify-center text-text-muted">
        No images available
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="group relative h-[300px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-teal-950 via-slate-800 to-indigo-950 sm:h-[430px] lg:h-[520px]">
        {!unavailableImages[currentIndex] ? (
          <img
            src={images[currentIndex]}
            alt={`Property image ${currentIndex + 1}`}
            onError={() => markImageUnavailable(currentIndex)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-white/75">
            <Building2 className="h-16 w-16 text-white/30" strokeWidth={1} />
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm backdrop-blur">Property photo unavailable</span>
          </div>
        )}
        
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-text hover:bg-white hover:text-primary transition-colors shadow-md opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-text hover:bg-white hover:text-primary transition-colors shadow-md opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm font-medium rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex overflow-x-auto gap-2 pb-2 snap-x scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden snap-start transition-all ${
                currentIndex === idx ? 'ring-2 ring-primary opacity-100' : 'opacity-60 hover:opacity-100'
              }`}
            >
              {!unavailableImages[idx] ? (
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  onError={() => markImageUnavailable(idx)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center bg-slate-200 text-slate-500">
                  <Building2 className="h-5 w-5" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
