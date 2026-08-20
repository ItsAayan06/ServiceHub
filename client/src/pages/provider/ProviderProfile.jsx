import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatCurrency } from '../../utils/helpers.js';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ProviderProfile() {
  const { provider, updateProvider } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    businessName: provider?.businessName || '',
    bio: provider?.bio || '',
    experience: provider?.experience || 0,
    serviceArea: provider?.serviceArea || 20,
    skills: provider?.skills?.length ? provider.skills : [''],
    services: provider?.services?.length ? provider.services : [{ name: '', price: '', unit: 'job', duration: 60 }],
    availability: provider?.availability?.length ? provider.availability : DAYS.map(day => ({ day, startTime: '09:00', endTime: '18:00', isAvailable: false })),
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setSkill = (i, v) => setForm(p => { const s = [...p.skills]; s[i] = v; return { ...p, skills: s }; });
  const setService = (i, k, v) => setForm(p => { const s = [...p.services]; s[i] = { ...s[i], [k]: v }; return { ...p, services: s }; });
  const setAvail = (i, k, v) => setForm(p => { const a = [...p.availability]; a[i] = { ...a[i], [k]: v }; return { ...p, availability: a }; });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/providers/me', {
        ...form,
        skills: form.skills.filter(Boolean),
        services: form.services.filter(s => s.name && s.price),
      });
      updateProvider(data.provider);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  if (!provider) return <div className="card p-8 text-center text-slate-500">No provider profile found.</div>;

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900">Edit Provider Profile</h1>

      {/* Basic info */}
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Basic Information</h2>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Business Name</label>
          <input type="text" value={form.businessName} onChange={set('businessName')} className="input" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
          <textarea value={form.bio} onChange={set('bio')} rows={4} className="input resize-none" maxLength={500} />
          <p className="text-xs text-slate-400 mt-1">{form.bio.length}/500</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Years of Experience</label>
            <input type="number" min={0} value={form.experience} onChange={set('experience')} className="input" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Service Area (km)</label>
            <input type="number" min={1} value={form.serviceArea} onChange={set('serviceArea')} className="input" />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card p-6 space-y-3">
        <h2 className="font-bold text-slate-900">Skills</h2>
        {form.skills.map((skill, i) => (
          <div key={i} className="flex gap-2">
            <input type="text" value={skill} onChange={e => setSkill(i, e.target.value)} className="input flex-1" placeholder={`Skill ${i + 1}`} />
            {form.skills.length > 1 && (
              <button type="button" onClick={() => setForm(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }))}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setForm(p => ({ ...p, skills: [...p.skills, ''] }))}
          className="flex items-center gap-2 text-sm text-primary-600 font-medium">
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {/* Services */}
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Services & Pricing</h2>
        {form.services.map((svc, i) => (
          <div key={i} className="p-4 border-2 border-slate-100 rounded-xl space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Service {i + 1}</span>
              {form.services.length > 1 && (
                <button type="button" onClick={() => setForm(p => ({ ...p, services: p.services.filter((_, idx) => idx !== i) }))}
                  className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
            <input type="text" value={svc.name} onChange={e => setService(i, 'name', e.target.value)} placeholder="Service name" className="input" />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Price (₹)</label>
                <input type="number" value={svc.price} onChange={e => setService(i, 'price', e.target.value)} className="input" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Per</label>
                <select value={svc.unit} onChange={e => setService(i, 'unit', e.target.value)} className="input">
                  <option value="job">Job</option>
                  <option value="hour">Hour</option>
                  <option value="visit">Visit</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Duration (min)</label>
                <input type="number" value={svc.duration} onChange={e => setService(i, 'duration', e.target.value)} className="input" />
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setForm(p => ({ ...p, services: [...p.services, { name: '', price: '', unit: 'job', duration: 60 }] }))}
          className="flex items-center gap-2 text-sm text-primary-600 font-medium">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Availability */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 mb-4">Availability</h2>
        <div className="space-y-3">
          {form.availability.map((slot, i) => (
            <div key={slot.day} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${slot.isAvailable ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
              <input type="checkbox" id={`day-${i}`} checked={slot.isAvailable}
                onChange={e => setAvail(i, 'isAvailable', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded" />
              <label htmlFor={`day-${i}`} className="w-10 font-semibold text-slate-700 text-sm">{slot.day}</label>
              {slot.isAvailable && (
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" value={slot.startTime} onChange={e => setAvail(i, 'startTime', e.target.value)} className="input py-1.5 text-sm" />
                  <span className="text-slate-400 text-sm">to</span>
                  <input type="time" value={slot.endTime} onChange={e => setAvail(i, 'endTime', e.target.value)} className="input py-1.5 text-sm" />
                </div>
              )}
              {!slot.isAvailable && <span className="text-sm text-slate-400">Off</span>}
            </div>
          ))}
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 px-8">
        <Save className="w-4 h-4" />
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}
