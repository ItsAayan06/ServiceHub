import { useState } from 'react';
import { Camera, Save } from 'lucide-react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { getInitials } from '../../utils/helpers.js';
import toast from 'react-hot-toast';

export default function UserProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', {
        name: form.name, phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
      });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await api.post('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Upload failed');
    } finally { setUploading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

      {/* Avatar */}
      <div className="card p-6 flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-lg">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(user?.name)}
          </div>
          <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary-700 shadow-md">
            {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
          </label>
        </div>
        <div>
          <p className="font-bold text-slate-900 text-lg">{user?.name}</p>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <span className="badge bg-primary-100 text-primary-700 mt-1 capitalize">{user?.role}</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <h2 className="font-bold text-slate-900">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <input type="text" value={form.name} onChange={set('name')} className="input" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
            <input type="tel" value={form.phone} onChange={set('phone')} className="input" />
          </div>
        </div>

        <hr className="border-slate-100" />
        <h3 className="font-bold text-slate-900">Address</h3>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Street</label>
          <input type="text" value={form.street} onChange={set('street')} placeholder="123 Main Street" className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
            <input type="text" value={form.city} onChange={set('city')} className="input" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">State</label>
            <input type="text" value={form.state} onChange={set('state')} className="input" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">PIN Code</label>
          <input type="text" value={form.pincode} onChange={set('pincode')} className="input w-32" maxLength={6} />
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
