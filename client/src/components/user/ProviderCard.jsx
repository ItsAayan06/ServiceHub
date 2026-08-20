import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, CheckCircle } from 'lucide-react';
import { getInitials, formatCurrency } from '../../utils/helpers.js';
import StarRating from '../common/StarRating.jsx';

export default function ProviderCard({ provider }) {
  const { user, category, rating, reviewCount, experience, services, completedJobs, distance } = provider;
  const minPrice = services?.length ? Math.min(...services.map(s => s.price)) : null;

  return (
    <Link to={`/providers/${provider._id}`}
      className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 block group">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden flex-shrink-0 shadow-md">
            {user?.avatar
              ? <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
              : getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-primary-600 transition-colors truncate">
                {user?.name}
              </h3>
              {provider.isApproved && (
                <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 font-medium">
                {category?.icon} {category?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Rating & experience */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <StarRating rating={Math.round(rating)} size="sm" />
            <span className="text-sm font-semibold text-slate-700">{rating?.toFixed(1)}</span>
            <span className="text-xs text-slate-400">({reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">{experience}y exp.</span>
          </div>
          {distance !== undefined && (
            <div className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs">{distance} km</span>
            </div>
          )}
        </div>

        {/* Services preview */}
        {services?.slice(0, 2).map((svc, i) => (
          <div key={i} className="flex items-center justify-between mt-3 text-sm">
            <span className="text-slate-600 truncate max-w-[60%]">{svc.name}</span>
            <span className="font-bold text-primary-600">{formatCurrency(svc.price)}</span>
          </div>
        ))}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{completedJobs}</span> jobs done
          </div>
          {minPrice && (
            <div className="text-xs text-slate-500">
              From <span className="font-bold text-slate-900">{formatCurrency(minPrice)}</span>
            </div>
          )}
          <span className="text-xs font-semibold text-primary-600 group-hover:underline">
            Book Now →
          </span>
        </div>
      </div>
    </Link>
  );
}
