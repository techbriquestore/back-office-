import { useState, useEffect } from 'react';
import { Send, Users, Megaphone, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface Statistics {
  totalUsers: number;
  totalTokens: number;
  particulierUsers: number;
  professionnelUsers: number;
  particulierTokens: number;
  professionnelTokens: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  clientType: 'PARTICULIER' | 'PROFESSIONNEL';
  status: string;
}

export default function PushNotificationsPage() {
  const [targetType, setTargetType] = useState<'user' | 'users' | 'all' | 'segment'>('all');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [clientType, setClientType] = useState<'PARTICULIER' | 'PROFESSIONNEL'>('PARTICULIER');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.get<Statistics>('/push-notifications/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (targetType === 'user' || targetType === 'users') {
      fetchUsers();
    }
  }, [targetType]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (targetType === 'user' || targetType === 'users') {
        fetchUsers();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [userSearch]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const params = new URLSearchParams({
        search: userSearch,
        pageSize: '50',
      });
      const response = await apiClient.get<{ data: User[] }>(`/users/list?${params}`);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSend = async () => {
    if (!title || !body) {
      setResult({ success: false, message: 'Veuillez remplir le titre et le contenu' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let endpoint = '/push-notifications';
      let payload: any = { title, body };

      switch (targetType) {
        case 'user':
          if (selectedUserIds.length === 0) {
            setResult({ success: false, message: 'Veuillez sélectionner au moins un utilisateur' });
            setLoading(false);
            return;
          }
          endpoint += '/send-to-user';
          payload.userId = selectedUserIds[0];
          break;
        case 'users':
          if (selectedUserIds.length === 0) {
            setResult({ success: false, message: 'Veuillez sélectionner au moins un utilisateur' });
            setLoading(false);
            return;
          }
          endpoint += '/send-to-users';
          payload.userIds = selectedUserIds;
          break;
        case 'segment':
          endpoint += '/send-to-segment';
          payload.clientType = clientType;
          break;
        case 'all':
          endpoint += '/send-to-all';
          break;
      }

      const response = await apiClient.post<{ success: boolean; error?: string }>(endpoint, payload);
      
      if (response.data.success) {
        setResult({ success: true, message: 'Notification envoyée avec succès' });
        setTitle('');
        setBody('');
        setSelectedUserIds([]);
      } else {
        setResult({ success: false, message: response.data.error || 'Aucun token actif trouvé - les utilisateurs doivent ouvrir l\'app mobile' });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Erreur lors de l\'envoi' });
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
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
                        ? 'bg-[#FF8C00] text-white'
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
                        ? 'bg-[#FF8C00] text-white'
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
                        ? 'bg-[#FF8C00] text-white'
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
                        ? 'bg-[#FF8C00] text-white'
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
                  >
                    <option value="PARTICULIER">Particulier</option>
                    <option value="PROFESSIONNEL">Professionnel</option>
                  </select>
                </div>
              )}

              {/* Sélection d'utilisateurs */}
              {(targetType === 'user' || targetType === 'users') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {targetType === 'user' ? 'Sélectionner un utilisateur' : 'Sélectionner des utilisateurs'}
                  </label>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Rechercher par nom, téléphone..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C00] mb-3"
                  />
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                    {loadingUsers ? (
                      <div className="p-4 text-center text-gray-500">Chargement...</div>
                    ) : users.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">Aucun utilisateur trouvé</div>
                    ) : (
                      users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50"
                        >
                          <input
                            type={targetType === 'user' ? 'radio' : 'checkbox'}
                            name="user"
                            checked={
                              targetType === 'user'
                                ? selectedUserIds[0] === user.id
                                : selectedUserIds.includes(user.id)
                            }
                            onChange={() => {
                              if (targetType === 'user') {
                                setSelectedUserIds([user.id]);
                              } else {
                                setSelectedUserIds((prev) =>
                                  prev.includes(user.id)
                                    ? prev.filter((id) => id !== user.id)
                                    : [...prev, user.id]
                                );
                              }
                            }}
                            className="h-4 w-4 text-[#FF8C00] focus:ring-[#FF8C00] border-gray-300"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{user.phone}</p>
                          </div>
                          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            {user.clientType}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  {targetType === 'users' && selectedUserIds.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedUserIds.length} utilisateur(s) sélectionné(s)
                    </p>
                  )}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
                />
              </div>

              {/* Bouton d'envoi */}
              <button
                onClick={handleSend}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#FF8C00] text-white rounded-md hover:bg-[#E67E00] transition-colors disabled:bg-gray-400"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Statistiques
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total utilisateurs</span>
                <span className="font-semibold">{loadingStats ? '...' : statistics?.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tokens actifs</span>
                <span className="font-semibold text-green-600">{loadingStats ? '...' : statistics?.totalTokens || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Particuliers</span>
                <span className="font-semibold">{loadingStats ? '...' : statistics?.particulierUsers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Professionnels</span>
                <span className="font-semibold">{loadingStats ? '...' : statistics?.professionnelUsers || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
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
