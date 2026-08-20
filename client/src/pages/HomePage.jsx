import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Shield, Clock, ChevronRight, ArrowRight } from 'lucide-react';
import api from '../utils/api.js';
import ProviderCard from '../components/user/ProviderCard.jsx';
import { getUserLocation } from '../utils/helpers.js';

const CATEGORIES = [
  { icon: '⚡', name: 'Electrician', slug: 'electrician', color: 'bg-amber-50 border-amber-200 hover:border-amber-400' },
  { icon: '🔧', name: 'Plumber', slug: 'plumber', color: 'bg-blue-50 border-blue-200 hover:border-blue-400' },
  { icon: '❄️', name: 'AC Repair', slug: 'ac-repair', color: 'bg-cyan-50 border-cyan-200 hover:border-cyan-400' },
  { icon: '🧹', name: 'Cleaning', slug: 'cleaning', color: 'bg-green-50 border-green-200 hover:border-green-400' },
  { icon: '🪚', name: 'Carpenter', slug: 'carpenter', color: 'bg-orange-50 border-orange-200 hover:border-orange-400' },
  { icon: '🎨', name: 'Painter', slug: 'painter', color: 'bg-purple-50 border-purple-200 hover:border-purple-400' },
  { icon: '🌿', name: 'Gardener', slug: 'gardener', color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400' },
  { icon: '🔒', name: 'Security', slug: 'security', color: 'bg-slate-50 border-slate-200 hover:border-slate-400' },
];

const STATS = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '2,500+', label: 'Verified Providers' },
  { value: '50+', label: 'Service Categories' },
  { value: '4.8★', label: 'Average Rating' },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [provRes, catRes] = await Promise.all([
          api.get('/providers?limit=6'),
          api.get('/categories'),
        ]);
        setFeaturedProviders(provRes.data.providers || []);
        setCategories(catRes.data.categories || []);
      } catch {}
    };
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/services?search=${search}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #0ea5e9 0%, transparent 50%), radial-gradient(circle at 70% 20%, #38bdf8 0%, transparent 40%)' }} />
        <div className="relative page-container py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm mb-6 border border-white/20 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              2,500+ verified professionals ready
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Book Trusted<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-cyan-300">
                Local Services
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-xl">
              Find skilled electricians, plumbers, cleaners and more — verified, rated, and ready to help.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
              <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-lg">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="What service do you need?"
                  className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 outline-none font-medium" />
              </div>
              <button type="submit" className="btn-primary px-6 py-4 text-base rounded-2xl shadow-lg whitespace-nowrap">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2 mt-5">
              {['Electrician', 'Plumber', 'AC Repair', 'Cleaning'].map(s => (
                <Link key={s} to={`/services?search=${s}`}
                  className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm text-white/80 hover:text-white transition-all border border-white/10">
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-100">
        <div className="page-container py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-1">{value}</div>
                <div className="text-sm text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="page-container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Browse by Category</h2>
            <p className="text-slate-500">Find professionals across all home service categories</p>
          </div>
          <Link to="/services" className="flex items-center gap-1 text-primary-600 font-semibold text-sm hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {(categories.length > 0 ? categories : CATEGORIES).map((cat) => (
            <Link key={cat.slug || cat._id}
              to={`/services?cat=${cat.slug || cat._id}`}
              className={`border-2 rounded-2xl p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${cat.color || 'bg-slate-50 border-slate-200 hover:border-slate-400'}`}>
              <div className="text-3xl mb-2">{cat.icon || '🔧'}</div>
              <div className="text-xs font-semibold text-slate-700 leading-tight">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Providers */}
      {featuredProviders.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="page-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Top Rated Professionals</h2>
                <p className="text-slate-500">Handpicked experts with excellent reviews</p>
              </div>
              <Link to="/services" className="flex items-center gap-1 text-primary-600 font-semibold text-sm hover:underline">
                See all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredProviders.map(p => <ProviderCard key={p._id} provider={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="page-container py-16">
        <div className="text-center mb-12">
          <h2 className="section-title text-3xl">How ServiceHub Works</h2>
          <p className="text-slate-500 mt-2">Book a service in 3 simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', icon: '🔍', title: 'Search & Browse', desc: 'Find the right professional by category, location, or search.' },
            { step: '02', icon: '📅', title: 'Book Instantly', desc: 'Choose your preferred date, time and confirm the booking.' },
            { step: '03', icon: '✅', title: 'Get it Done', desc: 'Professional arrives, completes the work. Pay & rate.' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="text-center group">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-primary-50 flex items-center justify-center text-4xl mb-5 group-hover:scale-105 transition-transform shadow-sm">
                {icon}
              </div>
              <div className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-2">Step {step}</div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-gradient-to-br from-primary-50 to-cyan-50 py-12 border-y border-primary-100">
        <div className="page-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Verified Professionals', desc: 'Every provider is ID-verified and background-checked.' },
              { icon: Star, title: 'Quality Guaranteed', desc: 'Rated by real customers after each completed service.' },
              { icon: Clock, title: '24/7 Support', desc: 'We\'re here whenever you need help, day or night.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-6 bg-white/80 rounded-2xl border border-primary-100 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-container py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to get started?</h2>
          <p className="text-slate-500 mb-8">Join thousands of happy customers who trust ServiceHub for their home service needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base py-3 px-8">Book a Service</Link>
            <Link to="/register?role=provider" className="btn-secondary text-base py-3 px-8">Join as Provider</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
