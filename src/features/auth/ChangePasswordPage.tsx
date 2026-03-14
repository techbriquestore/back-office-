import { useState } from 'react';
import { Lock, Eye, EyeOff, Save, CheckCircle } from 'lucide-react';

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const isValid = form.current.length > 0 && form.newPass.length >= 6 && form.newPass === form.confirm;

  const handleSave = () => {
    if (!isValid) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setForm({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Changer le mot de passe</h1>
        <p className="text-sm text-gray-500 mt-1">Mettez à jour votre mot de passe de connexion</p>
      </div>

      <div className="max-w-lg">
        {success && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            <CheckCircle size={16} /> Mot de passe modifié avec succès !
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg mb-6">
            <Lock size={16} className="text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-700">Le mot de passe doit contenir au moins 6 caractères.</p>
          </div>

          <div className="space-y-5">
            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe actuel</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={form.current}
                  onChange={(e) => setForm({ ...form, current: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={form.newPass}
                  onChange={(e) => setForm({ ...form, newPass: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.newPass.length > 0 && form.newPass.length < 6 && (
                <p className="text-xs text-red-500 mt-1">Minimum 6 caractères</p>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none"
                />
              </div>
              {form.confirm.length > 0 && form.newPass !== form.confirm && (
                <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={!isValid || saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#FF8C00] text-white font-semibold rounded-lg hover:bg-[#E67E00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
