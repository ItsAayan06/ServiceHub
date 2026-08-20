import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, Star, CheckCircle, Phone, ChevronRight, MessageCircle } from 'lucide-react';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDate, getInitials } from '../utils/helpers.js';
import StarRating from '../components/common/StarRating.jsx';
import { PageLoader } from '../components/common/Spinner.jsx';

export default function ProviderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          api.get(`/providers/${id}`),
          api.get(`/reviews/provider/${id}`),
        ]);
        setProvider(pRes.data.provider);
        setReviews(rRes.data.reviews || []);
      } catch { navigate('/services'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleBook = (serviceIndex) => {
    if (!user) return navigate('/login');
    if (user.role !== 'user') return;
    navigate(`/dashboard/book/${id}?service=${serviceIndex}`);
  };

  if (loading) return <PageLoader />;
  if (!provider) return null;

  const { user: pUser, category, rating, reviewCount, experience, services, skills, bio, completedJobs, availability } = provider;

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Profile */}
        <div className="lg:col-span-1 space-y-5">
          <div className="card p-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-3xl font-bold mb-4 overflow-hidden shadow-lg">
              {pUser?.avatar ? <img src={pUser.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(pUser?.name)}
            </div>
            <h1 className="text-xl font-bold text-slate-900">{pUser?.name}</h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-sm text-slate-500 bg-primary-50 px-3 py-1 rounded-full">{category?.icon} {category?.name}</span>
            </div>
            {provider.isApproved && (
              <div className="flex items-center justify-center gap-1.5 mt-3 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Verified Professional
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{rating?.toFixed(1)}</div>
                <div className="text-xs text-slate-500">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{completedJobs}</div>
                <div className="text-xs text-slate-500">Jobs Done</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{experience}y</div>
                <div className="text-xs text-slate-500">Experience</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 mt-4">
              <StarRating rating={Math.round(rating)} />
              <span className="text-sm text-slate-500 ml-1">({reviewCount} reviews)</span>
            </div>
          </div>

          {/* Contact */}
          {user && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3">Contact</h3>
              {pUser?.phone && (
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{pUser.phone}</span>
                </div>
              )}
              {pUser?.address?.city && (
                <div className="flex items-center gap-3 text-slate-600 mt-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{pUser.address.city}, {pUser.address.state}</span>
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          {skills?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* About */}
          <div className="card p-6">
            <p className="text-slate-600 leading-relaxed">{bio}</p>
          </div>

          {/* Tabs */}
          <div>
            <div className="flex border-b border-slate-200 mb-5">
              {['services', 'reviews', 'availability'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 font-semibold text-sm capitalize transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                  {tab} {tab === 'reviews' && `(${reviewCount})`}
                </button>
              ))}
            </div>

            {activeTab === 'services' && (
              <div className="space-y-3">
                {services?.map((svc, i) => (
                  <div key={i} className="card p-5 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900">{svc.name}</h4>
                      <p className="text-sm text-slate-500 mt-0.5">Per {svc.unit} • ~{svc.duration || 60} min</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600">{formatCurrency(svc.price)}</div>
                        <div className="text-xs text-slate-400">/{svc.unit}</div>
                      </div>
                      {user?.role === 'user' && (
                        <button onClick={() => handleBook(i)} className="btn-primary text-sm py-2 px-4">
                          Book <ChevronRight className="w-4 h-4 inline" />
                        </button>
                      )}
                      {!user && (
                        <Link to="/login" className="btn-primary text-sm py-2 px-4">Book</Link>
                      )}
                    </div>
                  </div>
                ))}
                {(!services || services.length === 0) && (
                  <p className="text-slate-500 text-center py-8">No services listed yet.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">No reviews yet. Be the first!</div>
                ) : reviews.map(r => (
                  <div key={r._id} className="card p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {r.user?.avatar ? <img src={r.user.avatar} alt="" className="w-full h-full object-cover rounded-full" /> : getInitials(r.user?.name)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{r.user?.name}</span>
                          <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                        </div>
                        <StarRating rating={r.rating} size="sm" />
                        <p className="text-slate-600 text-sm mt-2">{r.comment}</p>
                        {r.response && (
                          <div className="mt-3 p-3 bg-primary-50 rounded-lg border border-primary-100">
                            <p className="text-xs font-semibold text-primary-700 mb-1">Provider response:</p>
                            <p className="text-sm text-slate-600">{r.response.comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="card p-5">
                {availability?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {availability.map((slot, i) => (
                      <div key={i} className={`p-3 rounded-xl border-2 text-center ${slot.isAvailable ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50 opacity-50'}`}>
                        <p className="font-bold text-slate-900 text-sm">{slot.day}</p>
                        {slot.isAvailable && <p className="text-xs text-slate-500 mt-1">{slot.startTime} – {slot.endTime}</p>}
                        {!slot.isAvailable && <p className="text-xs text-slate-400 mt-1">Unavailable</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">Availability not set. Contact directly to schedule.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
