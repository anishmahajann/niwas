import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, House, Menu, Plus, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { savedProperties, user, signOut, openAuthDialog, addToast } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const handleSignOut = async () => {
    try {
      await signOut();
      addToast('You have signed out.');
    } catch (error) {
      addToast(`Could not sign out: ${error.message}`, 'error');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_2px_12px_rgba(15,23,42,.04)] backdrop-blur-xl">
      <nav className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-5 px-4 sm:px-7 lg:px-10" aria-label="Main navigation">
        <Link to="/" className="group inline-flex shrink-0 items-center gap-2.5" onClick={closeMenu}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#12383b] text-teal-100 transition group-hover:bg-[#1b5554]">
            <House className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="text-[21px] font-semibold tracking-[-0.04em] text-slate-900">niwas<span className="text-teal-700">.</span></span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link to="/search" className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Buy</Link>
          <Link to="/search?type=rent" className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Rent</Link>
          <Link to="/search?type=commercial" className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Commercial</Link>
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="max-w-28 truncate text-xs font-medium text-slate-600">{user.name.split(' ')[0]}</span>
              <button type="button" onClick={handleSignOut} className="rounded-lg px-2 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100">Sign out</button>
            </div>
          ) : (
            <button type="button" onClick={openAuthDialog} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Sign in</button>
          )}
          <Link to="/saved" className="relative inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            <Heart className="h-[17px] w-[17px]" />
            Saved
            {savedProperties.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-800 px-1 text-[11px] font-semibold text-white">
                {savedProperties.length}
              </span>
            )}
          </Link>
          <Link to="/admin" aria-label="Admin demo" className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <ShieldCheck className="h-[17px] w-[17px]" />
          </Link>
          <Link to="/post" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#12383b] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b5554]">
            <Plus className="h-4 w-4" />
            List a property
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 shadow-lg md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <Link to="/search" onClick={closeMenu} className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Buy a home</Link>
            <Link to="/search?type=rent" onClick={closeMenu} className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Find a rental</Link>
            <Link to="/search?type=commercial" onClick={closeMenu} className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Commercial</Link>
            {user ? (
              <button type="button" onClick={handleSignOut} className="rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                Signed in as {user.name} · Sign out
              </button>
            ) : (
              <button type="button" onClick={() => { closeMenu(); openAuthDialog(); }} className="rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">Sign in or create account</button>
            )}
            <Link to="/saved" onClick={closeMenu} className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Heart className="h-4 w-4" /> Saved homes <span className="text-slate-400">{savedProperties.length}</span>
            </Link>
            <Link to="/post" onClick={closeMenu} className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#12383b] px-4 py-3 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" /> List a property
            </Link>
            <Link to="/admin" onClick={closeMenu} className="flex items-center gap-2 rounded-xl px-3 py-3 text-xs font-medium text-slate-500 hover:bg-slate-50">
              <ShieldCheck className="h-4 w-4" /> Admin demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
