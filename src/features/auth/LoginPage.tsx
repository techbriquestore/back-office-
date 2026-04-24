import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '@/core/stores/auth.store';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      console.log('Tentative de login...');
      await login(email, password);
      console.log('Login réussi, redirection vers /admin/dashboard...');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      console.error('Login échoué:', err);
      // error is set in store
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E2D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="BRIQUES.STORE" className="w-20 h-20 mx-auto mb-4 rounded-2xl object-contain" />
          <h1 className="text-2xl font-bold text-white">
            BRIQUES<span className="text-[#FF8C00]">.STORE</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Administration</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-1">Connexion</h2>
          <p className="text-sm text-gray-500 mb-6">
            Accédez à votre espace d'administration
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@briques.store"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-[#FF8C00] text-white font-semibold py-2.5 rounded-lg hover:bg-[#E67E00] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                Se connecter
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-4">
          © {new Date().getFullYear()} BRIQUES.STORE — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
