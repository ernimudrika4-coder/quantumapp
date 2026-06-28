import { Crown, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PlanCard() {
  const { user } = useAuth();
  const plan = user?.plan ?? 'free';
  const isPro = plan === 'pro' || plan === 'elite';

  return (
    <div className="glossy rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        {isPro ? <ShieldCheck className="w-4 h-4 text-success" /> : <Crown className="w-4 h-4 text-amber-400" />}
        <div className="font-semibold text-[14px] text-ink-900">Plan Saat Ini</div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-display text-lg font-bold text-chrome-bright uppercase">{plan}</div>
          <div className="text-[11px] text-ink-500 mt-1">
            {isPro ? 'Akses analytics lanjut dan push notification tersedia.' : 'Upgrade untuk analytics lanjut, push, dan limit watchlist lebih besar.'}
          </div>
        </div>
        {!isPro && (
          <Link to="/" className="btn-primary text-[12px] px-3 py-2 rounded-xl inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Upgrade
          </Link>
        )}
      </div>
    </div>
  );
}
