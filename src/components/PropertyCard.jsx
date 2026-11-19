import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Maximize, AlertTriangle, ShieldCheck, UserCheck, FileText, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice, formatArea } from '../utils/formatters';
import { getFreshnessStatus, getTimeSince } from '../utils/verification';

export default function PropertyCard({ property }) {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const { savedProperties, toggleSaveProperty } = useApp();
  const isSaved = savedProperties.includes(property.id);

  // Trust score color mapping
  const score = property.trustScore?.total || 0;
  let scoreColor = 'bg-failed text-white';
  if (score >= 80) scoreColor = 'bg-verified text-white';
  else if (score >= 60) scoreColor = 'bg-accent text-white';
  else if (score >= 40) scoreColor = 'bg-pending text-white';

  const freshness = property.lastVerifiedAt
    ? getFreshnessStatus(property.lastVerifiedAt)
    : null;

  const docsChecked = property.verification?.documentsReviewed?.checked || 0;

  return (
    <article className="property-card group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_14px_rgba(15,23,42,.045)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_16px_34px_rgba(15,23,42,.12)]">
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-teal-900 via-slate-700 to-indigo-950">
        {!imageUnavailable && (
        <Link to={`/property/${property.id}`}>
          <img
            src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'}
            alt={property.title}
            loading="lazy"
            onError={() => setImageUnavailable(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        )}
        {imageUnavailable && (
          <Link to={`/property/${property.id}`} className="flex h-full items-end p-5 text-white">
            <Building2 className="absolute right-4 top-4 h-20 w-20 text-white/15" strokeWidth={1} />
            <span className="relative rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
              {property.propertyType}
            </span>
          </Link>
        )}
        {!imageUnavailable && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/25 to-transparent" />}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="rounded-full border border-white/50 bg-white/95 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-800 shadow-sm backdrop-blur">
            {property.listingType}
          </span>
          {property.availabilityStatus === 'available' && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-600/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Available
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaveProperty(property.id);
          }}
          className="absolute right-3 top-3 rounded-full border border-white/50 bg-white/95 p-2 text-slate-500 shadow-sm backdrop-blur transition hover:text-rose-600"
          aria-label={isSaved ? 'Remove from saved properties' : 'Save property'}
        >
          <Heart className={`h-5 w-5 ${isSaved ? 'fill-failed text-failed' : ''}`} />
        </button>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/property/${property.id}`} className="hover:text-primary transition-colors flex-grow pr-2">
            <h3 className="truncate text-[15px] font-semibold tracking-tight text-slate-900" title={property.title}>
              {property.title}
            </h3>
          </Link>
          <div className="flex-shrink-0 flex items-center gap-1" title="Niwas Trust Score">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${scoreColor}`} title="Niwas Trust Score">
              {score}
            </div>
          </div>
        </div>

        <div className="mb-3 text-xl font-semibold tracking-tight text-slate-900">
          {formatPrice(property.price, property.listingType)}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="mr-1 h-4 w-4 text-slate-400" />
              <span>{property.bedrooms} BHK</span>
            </div>
          )}
          <div className="flex items-center">
            <Maximize className="mr-1 h-4 w-4 text-slate-400" />
            <span>{formatArea(property.area, property.propertyType)}</span>
          </div>
          <div className="flex items-center truncate">
            <MapPin className="mr-1 h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">{property.locality}</span>
          </div>
        </div>

        <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
          {freshness && (
            <div className={`flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${freshness.bgColor} ${freshness.color}`}>
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Verified {getTimeSince(property.lastVerifiedAt)}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {property.verification?.ownerVerified?.status === 'verified' && (
              <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
                <UserCheck className="w-3 h-3 mr-1 text-verified" /> Owner Verified
              </span>
            )}
            {property.verification?.locationVerified?.status === 'verified' && (
              <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
                <MapPin className="w-3 h-3 mr-1 text-verified" /> Location Verified
              </span>
            )}
            {docsChecked > 0 && (
              <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
                <FileText className="w-3 h-3 mr-1 text-accent" />
                {docsChecked} docs checked
              </span>
            )}
          </div>

          {property.reports && property.reports.length > 0 && (
            <div className="flex items-center text-xs text-failed mt-2 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              {property.reports.length} pending report{property.reports.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
