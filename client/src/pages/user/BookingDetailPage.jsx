import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Calendar, Clock, MessageSquare, Star } from 'lucide-react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import StarRating from '../../components/common/StarRating.jsx';
import { formatDateTime, formatCurrency, getInitials } from '../../utils/helpers.js';
import { PageLoader } from '../../components/common/Spinner.jsx';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'accepted', 'in_progress', 'completed'];

export default function BookingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/bookings/${id}`)
      .then(r => setBooking(r.data.booking))
      .catch(() => navigate('/dashboard/bookings'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    const reason = prompt('Reason for cancellation (optional):') ?? '';
    setCancelling(true);
    try {
      const { data } = await api.put(`/bookings/${id}/status`, { status: 'cancelled', cancellationReason: reason });
      setBooking(data.booking);
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    } finally { setCancelling(false); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { bookingId: id, ...review });
      toast.success('Review submitted! Thank you.');
      setShowReview(false);
      setBooking(b => ({ ...b, isReviewed: true }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return <PageLoader />;
  if (!booking) return null;

  const activeStep = STATUS_STEPS.indexOf(booking.status);
  const canCancel = ['pending', 'accepted'].includes(booking.status);
  const canReview = booking.status === 'completed' && !booking.isReviewed && user?.role === 'user';

  const provider = booking.provider;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-5">
      <button onClick={() => navigate('/dashboard/bookings')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium">
        <ChevronLeft className="w-5 h-5" /> Back to Bookings
      </button>

      {/* Status header */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{booking.service?.name}</h1>
            <p className="text-slate-500 text-sm mt-1">Booking #{booking._id.slice(-8).toUpperCase()}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Progress bar */}
        {!['cancelled', 'rejected'].includes(booking.status) && (
          <div className="relative">
            <div className="flex justify-between mb-2">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className={`text-xs font-semibold capitalize text-center flex-1 ${i <= activeStep ? 'text-primary-600' : 'text-slate-400'}`}>
                  {step.replace('_', ' ')}
                </div>
              ))}
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-700"
                style={{ width: `${((activeStep + 1) / STATUS_STEPS.length) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Provider info */}
      <div className="card p-5">
        <h2 className="font-bold text-slate-900 mb-4">Service Professional</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden flex-shrink-0">
            {provider?.user?.avatar ? <img src={provider.user.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(provider?.user?.name)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{provider?.user?.name}</p>
            <p className="text-sm text-slate-500">{provider?.category?.icon} {provider?.category?.name}</p>
            {provider?.user?.phone && <p className="text-sm text-primary-600 font-medium">{provider.user.phone}</p>}
          </div>
        </div>
      </div>

      {/* Booking details */}
      <div className="card p-5 space-y-4">
        <h2 className="font-bold text-slate-900">Booking Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Date</p>
              <p className="text-sm font-semibold text-slate-900">{formatDateTime(booking.scheduledDate).split('•')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Time</p>
              <p className="text-sm font-semibold text-slate-900">{booking.scheduledTime}</p>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-slate-400">Address</p>
            <p className="text-sm font-semibold text-slate-900">{booking.address?.street}, {booking.address?.city} {booking.address?.pincode}</p>
          </div>
        </div>
        {booking.notes && (
          <div className="flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400">Notes</p>
              <p className="text-sm text-slate-600">{booking.notes}</p>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className="font-semibold text-slate-700">Total Amount</span>
          <span className="text-xl font-bold text-primary-600">{formatCurrency(booking.totalAmount)}</span>
        </div>
      </div>

      {/* Status history */}
      <div className="card p-5">
        <h2 className="font-bold text-slate-900 mb-4">Status History</h2>
        <div className="space-y-3">
          {booking.statusHistory?.map((h, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-700 capitalize">{h.status?.replace('_', ' ')}</p>
                <p className="text-xs text-slate-400">{formatDateTime(h.changedAt)} {h.note ? `· ${h.note}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review */}
      {canReview && !showReview && (
        <button onClick={() => setShowReview(true)} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          <Star className="w-4 h-4" /> Rate & Review
        </button>
      )}

      {showReview && (
        <div className="card p-6 animate-slide-up">
          <h2 className="font-bold text-slate-900 mb-4">Rate your experience</h2>
          <form onSubmit={handleReview} className="space-y-4">
            <div className="flex justify-center">
              <StarRating rating={review.rating} size="lg" interactive onChange={r => setReview(p => ({ ...p, rating: r }))} />
            </div>
            <textarea value={review.comment} onChange={e => setReview(p => ({ ...p, comment: e.target.value }))}
              rows={3} placeholder="Share your experience…" className="input resize-none" />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowReview(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={submittingReview} className="btn-primary flex-1">
                {submittingReview ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cancel */}
      {canCancel && (
        <button onClick={handleCancel} disabled={cancelling} className="btn-danger w-full py-3 opacity-90 hover:opacity-100">
          {cancelling ? 'Cancelling…' : 'Cancel Booking'}
        </button>
      )}
    </div>
  );
}
