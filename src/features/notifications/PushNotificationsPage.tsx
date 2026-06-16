import { useState } from 'react';
import { Send, Users, Megaphone, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PushNotificationsPage() {
  const [targetType, setTargetType] = useState<'user' | 'users' | 'all' | 'segment'>('all');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [clientType, setClientType] = useState<'PARTICULIER' | 'PROFESSIONNEL'>('PARTICULIER');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSend = async () => {
    if (!title || !body) {
      setResult({ success: false, message: 'Veuillez remplir le titre et le contenu' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const endpoint = '/api/v1/push-notifications';
      let payload: any = { title, body };

      switch (targetType) {
        case 'user':
          if (selectedUserIds.length === 0) {
            setResult({ success: false, message: 'Veuillez sélectionner au moins un utilisateur' });
            setLoading(false);
            return;
          }
          payload.userId = selectedUserIds[0];
          break;
        case 'users':
          if (selectedUserIds.length === 0) {
            setResult({ success: false, message: 'Veuillez sélectionner au moins un utilisateur' });
            setLoading(false);
            return;
          }
          payload.userIds = selectedUserIds;
          break;
        case 'segment':
          payload.clientType = clientType;
          break;
        case 'all':
          // Pas de paramètres supplémentaires
          break;
      }

      const response = await fetch(`${endpoint}/${targetType === 'user' ? 'send-to-user' : targetType === 'users' ? 'send-to-users' : targetType === 'segment' ? 'send-to-segment' : 'send-to-all'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: 'Notification envoyée avec succès' });
        setTitle('');
        setBody('');
        setSelectedUserIds([]);
      } else {
        setResult({ success: false, message: data.message || 'Erreur lors de l\'envoi' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications Push</h1>
          <p className="text-sm text-gray-600 mt-1">Envoyer des notifications push aux utilisateurs</p>
        </div>
        <Bell className="h-6 w-6 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire d'envoi */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Nouvelle notification
            </h2>

            <div className="space-y-4">
              {/* Type de cible */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de cible
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => setTargetType('all')}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      targetType === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setTargetType('segment')}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      targetType === 'segment'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    Segment
                  </button>
                  <button
                    onClick={() => setTargetType('user')}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      targetType === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    Utilisateur
                  </button>
                  <button
                    onClick={() => setTargetType('users')}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      targetType === 'users'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    Multi-utilisateurs
                  </button>
                </div>
              </div>

              {/* Sélection de segment */}
              {targetType === 'segment' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de client
                  </label>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value as 'PARTICULIER' | 'PROFESSIONNEL')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PARTICULIER">Particulier</option>
                    <option value="PROFESSIONNEL">Professionnel</option>
                  </select>
                </div>
              )}

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de la notification"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Contenu de la notification"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Bouton d'envoi */}
              <button
                onClick={handleSend}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                <Send className="h-4 w-4" />
                {loading ? 'Envoi...' : 'Envoyer la notification'}
              </button>

              {/* Résultat */}
              {result && (
                <div
                  className={cn(
                    'p-3 rounded-md',
                    result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  )}
                >
                  {result.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Statistiques
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total utilisateurs</span>
                <span className="font-semibold">1,234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tokens actifs</span>
                <span className="font-semibold text-green-600">856</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Particuliers</span>
                <span className="font-semibold">745</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Professionnels</span>
                <span className="font-semibold">111</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aide</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• <strong>Tous</strong> : Envoie à tous les utilisateurs avec un token actif</p>
              <p>• <strong>Segment</strong> : Envoie à un type de client spécifique</p>
              <p>• <strong>Utilisateur</strong> : Envoie à un utilisateur spécifique</p>
              <p>• <strong>Multi-utilisateurs</strong> : Envoie à plusieurs utilisateurs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
