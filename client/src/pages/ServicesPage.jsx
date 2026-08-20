import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, SlidersHorizontal, X } from 'lucide-react';
import api from '../utils/api.js';
import ProviderCard from '../components/user/ProviderCard.jsx';
import { PageLoader } from '../components/common/Spinner.jsx';
import { getUserLocation } from '../utils/helpers.js';

export default function ServicesPage() {
  const [params, setParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category: params.get('cat') || '',
    minRating: '',
    radius: '50',
    useLocation: false,
  });

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories || []));
  }, []);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.search) query.set('search', filters.search);
      if (filters.category) query.set('category', filters.category);
      if (filters.minRating) query.set('minRating', filters.minRating);
      if (filters.useLocation && userLocation) {
        query.set('lat', userLocation.lat);
        query.set('lng', userLocation.lng);
        query.set('radius', filters.radius);
      }
      const { data } = await api.get(`/providers?${query}`);
      setProviders(data.providers || []);
      setTotal(data.total || 0);
    } catch { setProviders([]); }
    finally { setLoading(false); }
  }, [filters, userLocation]);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const handleLocationToggle = async () => {
    if (!filters.useLocation) {
      try {
        const loc = await getUserLocation();
        setUserLocation(loc);
        setFilters(p => ({ ...p, useLocation: true }));
      } catch { alert('Could not get your location. Please enable location access.'); }
    } else {
      setFilters(p => ({ ...p, useLocation: false }));
    }
  };

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: val }));
  const clearFilters = () => setFilters({ search: '', category: '', minRating: '', radius: '50', useLocation: false });

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title text-3xl">Find Service Professionals</h1>
        <p className="text-slate-500">{total} professionals available</p>
      </div>

      {/* Search + filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl px-5 py-3 border border-slate-200 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input type="text" value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            placeholder="Search by name or service…"
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 outline-none text-sm" />
          {filters.search && (
            <button onClick={() => setFilter('search', '')}><X className="w-4 h-4 text-slate-400" /></button>
          )}
        </div>
        <button onClick={handleLocationToggle}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all ${filters.useLocation ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-200'}`}>
          <MapPin className="w-4 h-4" /> Near Me
        </button>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-5 mb-6 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Category</label>
              <select value={filters.category} onChange={e => setFilter('category', e.target.value)} className="input">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Min. Rating</label>
              <select value={filters.minRating} onChange={e => setFilter('minRating', e.target.value)} className="input">
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>
            {filters.useLocation && (
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Radius: {filters.radius} km</label>
                <input type="range" min="5" max="100" step="5" value={filters.radius}
                  onChange={e => setFilter('radius', e.target.value)} className="w-full" />
              </div>
            )}
          </div>
          <button onClick={clearFilters} className="mt-3 text-sm text-primary-600 hover:underline">Clear all filters</button>
        </div>
      )}

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('category', '')}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${!filters.category ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
          All
        </button>
        {categories.map(c => (
          <button key={c._id} onClick={() => setFilter('category', filters.category === c._id ? '' : c._id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${filters.category === c._id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? <PageLoader /> : providers.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No professionals found</h3>
          <p className="text-slate-500 mb-4">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {providers.map(p => <ProviderCard key={p._id} provider={p} />)}
        </div>
      )}
    </div>
  );
}
