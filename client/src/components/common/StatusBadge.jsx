import { statusColors, statusLabel } from '../../utils/helpers.js';

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${statusColors[status] || 'bg-slate-100 text-slate-600'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {statusLabel[status] || status}
    </span>
  );
}
