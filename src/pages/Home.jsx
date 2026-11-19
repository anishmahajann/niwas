import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, Building2, Clock3, FileCheck2, MapPin, ShieldCheck, UserRoundCheck,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';
import { popularLocations } from '../data/properties';
import { useApp } from '../context/AppContext';

const trustPillars = [
  {
    icon: Building2,
    title: 'The property exists',
    detail: 'A field visit confirms the home and its listed details.',
  },
  {
    icon: Clock3,
    title: 'Availability stays fresh',
    detail: 'See when the owner last confirmed it was available.',
  },
  {
    icon: UserRoundCheck,
    title: 'Know who is listing',
    detail: 'Owner and broker identity checks are shown clearly.',
  },
  {
    icon: FileCheck2,
    title: 'Documents, explained',
    detail: 'See what was reviewed and what is still missing.',
  },
];

function LocationCard({ location, index, onClick }) {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const fallbackStyles = [
    'from-sky-900 via-slate-700 to-indigo-950',
    'from-teal-900 via-emerald-800 to-slate-950',
    'from-orange-900 via-rose-900 to-indigo-950',
    'from-indigo-900 via-blue-800 to-slate-950',
  ];

  return (
    <button
      type="button"
      onClick={onClick}
      className="location-card group relative isolate min-h-52 overflow-hidden rounded-2xl bg-slate-800 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-300"
    >
      {!imageUnavailable && (
        <img
          src={location.image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={() => setImageUnavailable(true)}
          className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      )}
      {imageUnavailable && (
        <div className={`absolute inset-0 -z-20 bg-gradient-to-br ${fallbackStyles[index % fallbackStyles.length]}`}>
          <Building2 className="absolute -bottom-5 right-2 h-36 w-36 text-white/10" strokeWidth={1} />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}
      {!imageUnavailable && <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/85 via-slate-900/15 to-slate-900/10" />}
      <span className="absolute right-4 top-4 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
        {location.count.toLocaleString('en-IN')} homes
      </span>
      <span className="absolute bottom-4 left-4 text-xl font-semibold tracking-tight text-white">
        {location.name}
        <ArrowRight className="ml-2 inline h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
      </span>
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { properties, apiStatus } = useApp();
  const featuredProperties = properties
    .filter((property) => property.trustScore.total >= 80)
    .sort((a, b) => b.trustScore.total - a.trustScore.total)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-slate-900">
      <Navbar />

      <main>
        {apiStatus === 'offline' && (
          <div className="bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900">
            Backend unavailable — showing demo listings. Start MongoDB and the Niwas API for persistent data.
          </div>
        )}
        <section className="hero-surface relative isolate overflow-hidden bg-[#102e32] text-white">
          <div className="hero-glow absolute inset-0 -z-10" />
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-10 lg:pb-20 lg:pt-20">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-sm text-teal-50 backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-teal-300" />
                A clearer way to find your next home
              </div>
              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[3.6rem]">
                Find a home you can <span className="text-teal-300">actually trust.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Real properties. Recent checks. No mystery badges. See what was verified, when it happened, and what still needs a closer look.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-200">
                <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-teal-300" /> Checks you can see</span>
                <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-teal-300" /> Freshness you can judge</span>
              </div>
            </div>

            <div className="hero-illustration relative mx-auto hidden h-[340px] w-full max-w-[500px] lg:block" aria-hidden="true">
              <div className="hero-building absolute bottom-0 right-5 h-[290px] w-[360px] rounded-t-[120px] border border-white/20 bg-gradient-to-br from-teal-100/20 via-white/10 to-emerald-300/5 shadow-2xl backdrop-blur-sm">
                <div className="absolute inset-x-10 top-16 grid grid-cols-3 gap-5">
                  {Array.from({ length: 9 }, (_, index) => (
                    <span key={index} className="h-12 rounded-t-lg border border-white/20 bg-teal-100/25" />
                  ))}
                </div>
                <div className="absolute bottom-0 left-1/2 h-28 w-20 -translate-x-1/2 rounded-t-full border border-white/20 bg-[#163d40]" />
              </div>
              <div className="absolute bottom-10 left-0 h-36 w-36 rounded-full bg-teal-400/20 blur-3xl" />
              <div className="absolute left-3 top-12 rounded-2xl border border-white/20 bg-white/95 p-4 text-slate-800 shadow-xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Verification, in the open</p>
                    <p className="mt-0.5 text-xs text-slate-500">Property checked · 4 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-7 right-0 rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-slate-800 shadow-xl">
                <p className="text-xs font-medium text-slate-500">NIWAS TRUST SCORE</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">92 <span className="text-sm font-medium text-slate-400">/ 100</span></p>
              </div>
            </div>

            <div className="relative z-10 lg:col-span-2">
              <div className="mx-auto max-w-5xl rounded-2xl bg-white p-2 shadow-[0_24px_70px_-24px_rgba(0,0,0,.55)] sm:p-3">
                <SearchBar large />
              </div>
              <p className="mt-3 text-center text-xs text-slate-300">
                Search Chandigarh, Mohali, Delhi NCR and more
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Start with a place</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Popular locations</h2>
              </div>
              <Link to="/search" className="hidden items-center gap-1 text-sm font-semibold text-teal-800 hover:text-teal-950 sm:flex">
                Explore all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {popularLocations.map((location, index) => (
                <LocationCard
                  key={location.name}
                  location={location}
                  index={index}
                  onClick={() => navigate(`/search?city=${encodeURIComponent(location.name)}`)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200/80 bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-9 max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Trust, with receipts</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">A badge is not enough.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Every listing tells you what was checked, when it was checked, and what is still unverified.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {trustPillars.map(({ icon: Icon, title, detail }, index) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-[#fbfcfa] p-5 transition hover:border-teal-200 hover:bg-teal-50/40">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100/70 text-teal-800">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">0{index + 1}</p>
                  <h3 className="mt-1 font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Evidence, not just listings</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Recently checked homes</h2>
                <p className="mt-2 text-sm text-slate-600">Explore listings with transparent, up-to-date verification.</p>
              </div>
              <Link to="/search" className="hidden items-center gap-1 text-sm font-semibold text-teal-800 hover:text-teal-950 sm:flex">
                Browse properties <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            <Link to="/search" className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm sm:hidden">
              Browse properties <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="px-5 pb-14 sm:px-8 sm:pb-16 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-[#12383b] px-6 py-8 text-white sm:px-10 sm:py-10 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">For owners and brokers</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">List your property with clarity.</h2>
              <p className="mt-3 text-sm leading-6 text-teal-50/80 sm:text-base">Show prospective buyers what’s been checked—and build confidence from the first visit.</p>
            </div>
            <Link to="/post" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#12383b] transition hover:bg-teal-50">
              List a property <MapPin className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
