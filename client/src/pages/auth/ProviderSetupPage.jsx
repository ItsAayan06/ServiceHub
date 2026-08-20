import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function ProviderSetupPage() {
  const [categories, setCategories] = useState([]);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    categoryId: '', businessName: '', bio: '', experience: 1,
    skills: [''], services: [{ name: '', price: '', unit: 'job', duration: 60 }],
  });
  const [loading, setLoading] = useState(false);
  const { refetch } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories || []));
  }, []);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const addSkill = () => setForm(p => ({ ...p, skills: [...p.skills, ''] }));
  const setSkill = (i, v) => setForm(p => { const s = [...p.skills]; s[i] = v; return { ...p, skills: s }; });
  const removeSkill = (i) => setForm(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }));

  const addService = () => setForm(p => ({ ...p, services: [...p.services, { name: '', price: '', unit: 'job', duration: 60 }] }));
  const setService = (i, field, val) => setForm(p => {
    const s = [...p.services]; s[i] = { ...s[i], [field]: val }; return { ...p, services: s };
  });
  const removeService = (i) => setForm(p => ({ ...p, services: p.services.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/provider/setup', {
        ...form,
        skills: form.skills.filter(Boolean),
        services: form.services.filter(s => s.name && s.price),
      });
      await refetch();
      toast.success('Provider profile created! Awaiting admin approval.');
      navigate('/provider');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🔧</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Set Up Your Provider Profile</h1>
          <p className="text-slate-500 mt-2">Complete your profile to start receiving bookings</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-400'}`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-1 rounded-full transition-all ${step > s ? 'bg-primary-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-6 animate-slide-up">
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-slate-900">Basic Information</h2>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Service Category *</label>
                <select required value={form.categoryId} onChange={set('categoryId')} className="input">
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Business Name (optional)</label>
                <input type="text" value={form.businessName} onChange={set('businessName')}
                  placeholder="Your business name" className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bio / Description *</label>
                <textarea required value={form.bio} onChange={set('bio')} rows={4}
                  placeholder="Describe your expertise, what you specialize in…"
                  className="input resize-none" maxLength={500} />
                <p className="text-xs text-slate-400 mt-1">{form.bio.length}/500</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Years of Experience</label>
                <input type="number" min={0} max={50} value={form.experience} onChange={set('experience')} className="input w-32" />
              </div>
              <button type="button" onClick={() => { if (!form.categoryId || !form.bio) return toast.error('Fill required fields'); setStep(2); }}
                className="btn-primary w-full">Next →</button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-slate-900">Skills</h2>
              <div className="space-y-3">
                {form.skills.map((skill, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={skill} onChange={e => setSkill(i, e.target.value)}
                      placeholder={`Skill ${i + 1} (e.g. Wiring, Fitting)`} className="input flex-1" />
                    {form.skills.length > 1 && (
                      <button type="button" onClick={() => removeSkill(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addSkill}
                  className="flex items-center gap-2 text-sm text-primary-600 font-medium hover:underline">
                  <Plus className="w-4 h-4" /> Add skill
                </button>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1">Next →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-bold text-slate-900">Services & Pricing</h2>
              <div className="space-y-4">
                {form.services.map((svc, i) => (
                  <div key={i} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">Service {i + 1}</span>
                      {form.services.length > 1 && (
                        <button type="button" onClick={() => removeService(i)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input type="text" value={svc.name} onChange={e => setService(i, 'name', e.target.value)}
                      placeholder="Service name (e.g. Basic wiring repair)" className="input" />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Price (₹)</label>
                        <input type="number" value={svc.price} onChange={e => setService(i, 'price', e.target.value)}
                          placeholder="500" className="input" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Per</label>
                        <select value={svc.unit} onChange={e => setService(i, 'unit', e.target.value)} className="input">
                          <option value="job">Job</option>
                          <option value="hour">Hour</option>
                          <option value="visit">Visit</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addService}
                  className="flex items-center gap-2 text-sm text-primary-600 font-medium hover:underline">
                  <Plus className="w-4 h-4" /> Add service
                </button>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Creating profile…' : '🚀 Submit Profile'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
