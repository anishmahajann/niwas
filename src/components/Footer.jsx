import { Link } from 'react-router-dom';
import { Home, Globe, MessageCircle, Camera, Briefcase } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-12">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-4 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link to="/" className="flex items-center">
              <Home className="h-8 w-8 text-primary" />
              <span className="ml-2 text-2xl font-bold text-primary">Niwas</span>
            </Link>
            <p className="text-sm text-text-secondary">
              India's trust-first real estate marketplace. Verified listings, transparent history, secure transactions.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-text-muted hover:text-primary" aria-label="Facebook">
                <Globe className="h-6 w-6" />
              </a>
              <a href="#" className="text-text-muted hover:text-primary" aria-label="Instagram">
                <Camera className="h-6 w-6" />
              </a>
              <a href="#" className="text-text-muted hover:text-primary" aria-label="Twitter">
                <MessageCircle className="h-6 w-6" />
              </a>
              <a href="#" className="text-text-muted hover:text-primary" aria-label="LinkedIn">
                <Briefcase className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-3">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-text tracking-wider uppercase">Company</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/about" className="text-base text-text-secondary hover:text-primary">About</Link></li>
                  <li><Link to="/careers" className="text-base text-text-secondary hover:text-primary">Careers</Link></li>
                  <li><Link to="/contact" className="text-base text-text-secondary hover:text-primary">Contact</Link></li>
                  <li><Link to="/trust-policy" className="text-base text-text-secondary hover:text-primary font-medium">Trust Policy</Link></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-text tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/terms" className="text-base text-text-secondary hover:text-primary">Terms of Service</Link></li>
                  <li><Link to="/privacy" className="text-base text-text-secondary hover:text-primary">Privacy Policy</Link></li>
                  <li><Link to="/guidelines" className="text-base text-text-secondary hover:text-primary">Community Guidelines</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-text tracking-wider uppercase">Popular Cities</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/search?city=Mumbai" className="text-base text-text-secondary hover:text-primary">Mumbai</Link></li>
                  <li><Link to="/search?city=Delhi" className="text-base text-text-secondary hover:text-primary">Delhi NCR</Link></li>
                  <li><Link to="/search?city=Bengaluru" className="text-base text-text-secondary hover:text-primary">Bengaluru</Link></li>
                  <li><Link to="/search?city=Pune" className="text-base text-text-secondary hover:text-primary">Pune</Link></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-text tracking-wider uppercase">Services</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/services/legal" className="text-base text-text-secondary hover:text-primary">Legal Assistance</Link></li>
                  <li><Link to="/services/loans" className="text-base text-text-secondary hover:text-primary">Home Loans</Link></li>
                  <li><Link to="/services/interior" className="text-base text-text-secondary hover:text-primary">Interior Design</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-sm text-text-muted text-center italic">
            Disclaimer: Document review by Niwas does not constitute a legal title guarantee. Always consult a legal professional before finalizing property transactions.
          </p>
          <p className="mt-4 text-base text-text-muted text-center">
            &copy; {new Date().getFullYear()} Niwas Properties Pvt Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
