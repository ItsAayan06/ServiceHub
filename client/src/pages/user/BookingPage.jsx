import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, FileText, ChevronLeft } from 'lucide-react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatCurrency, getUserLocation } from '../../utils/helpers.js';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { providerId } = useParams();
  const [searchParams] = useSearchParams();
  const serviceIndex = Number(searchParams.get('service') || 0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    notes: '',
  });

  useEffect(() => {
    api.get(`/providers/${providerId}`)
      .then(r => setProvider(r.data.provider))
      .catch(() => navigate('/services'))
      .finally(() => setLoading(false));
  }, [providerId]);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const service = provider?.services?.[serviceIndex];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.scheduledDate || !form.scheduledTime || !form.street || !form.city)
      return toast.error('Please fill all required fields');

    setSubmitting(true);
    try {
      let location;
      try {
        const coords = await getUserLocation();
        location = { type: 'Point', coordinates: [coords.lng, coords.lat] };
      } catch {}

      const { data } = await api.post('/bookings', {
        providerId,
        serviceIndex,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        notes: form.notes,
        location,
      });
      toast.success('Booking created successfully!');
      navigate(`/dashboard/bookings/${data.booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  // Min date = today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium">
        <ChevronLeft className="w-5 h-5" /> Back
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Book Service</h1>

      {/* Service summary */}
      {service && (
        <div className="card p-5 mb-6 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Booking with <span className="font-semibold text-slate-700">{provider?.user?.name}</span></p>
              <h3 className="font-bold text-slate-900 text-lg mt-1">{service.name}</h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">{formatCurrency(service.price)}</div>
              <div className="text-xs text-slate-500">per {service.unit}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date & Time */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary-500" /> Schedule</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
              <input type="date" required min={today} value={form.scheduledDate} onChange={set('scheduledDate')} className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Time *</label>
              <input type="time" required value={form.scheduledTime} onChange={set('scheduledTime')} className="input" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-500" /> Service Address</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Street Address *</label>
              <input type="text" required value={form.street} onChange={set('street')} placeholder="123 Main Street" className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">City *</label>
                <input type="text" required value={form.city} onChange={set('city')} placeholder="Mumbai" className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">State</label>
                <input type="text" value={form.state} onChange={set('state')} placeholder="Maharashtra" className="input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">PIN Code</label>
              <input type="text" value={form.pincode} onChange={set('pincode')} placeholder="400001" className="input" maxLength={6} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-primary-500" /> Additional Notes</h3>
          <textarea value={form.notes} onChange={set('notes')} rows={3}
            placeholder="Describe the problem or any special instructions…"
            className="input resize-none" maxLength={500} />
          <p className="text-xs text-slate-400 mt-1">{form.notes.length}/500</p>
        </div>

        {/* Summary & CTA */}
        <div className="card p-5 bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-slate-700">Total Amount</span>
            <span className="text-2xl font-bold text-primary-600">{service ? formatCurrency(service.price) : '—'}</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">Payment will be collected after service completion.</p>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base">
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirming Booking…
              </span>
            ) : '✅ Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
