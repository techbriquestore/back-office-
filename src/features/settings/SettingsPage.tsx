import { useState } from 'react';
import {
  Users, CreditCard, Truck, FileText, Bell, ClipboardList,
  Shield, Plus, Edit, ToggleLeft, ToggleRight, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/core/utils/formatters';
import { ROLE_LABELS } from '@/core/types';
import type { Role } from '@/core/types';

type Tab = 'users' | 'payments' | 'delivery' | 'invoicing' | 'notifications' | 'preorders' | 'audit';

interface StaffUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED';
  lastLogin?: string;
}

const MOCK_STAFF: StaffUser[] = [
  { id: '1', firstName: 'Super', lastName: 'Admin', email: 'admin@briques.store', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLogin: '2026-03-05T09:00:00Z' },
  { id: '2', firstName: 'Konan', lastName: 'Marc', email: 'marc.konan@briques.store', role: 'COMMERCIAL_LOGISTICS', status: 'ACTIVE', lastLogin: '2026-03-05T08:30:00Z' },
  { id: '3', firstName: 'Marie', lastName: 'Kouadio', email: 'marie.k@briques.store', role: 'SERVICE_CLIENT', status: 'ACTIVE', lastLogin: '2026-03-05T07:45:00Z' },
  { id: '4', firstName: 'Jean', lastName: 'Patel', email: 'jean.p@briques.store', role: 'SERVICE_CLIENT', status: 'SUSPENDED' },
  { id: '5', firstName: 'Aminata', lastName: 'Diallo', email: 'aminata.d@briques.store', role: 'ADMIN', status: 'ACTIVE', lastLogin: '2026-03-04T16:00:00Z' },
];

interface AuditRow {
  id: string;
  userName: string;
  action: string;
  entity: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

const MOCK_AUDIT: AuditRow[] = [
  { id: '1', userName: 'Super Admin', action: 'BACKOFFICE_LOGIN', entity: 'User', details: 'Connexion réussie', ipAddress: '192.168.1.10', createdAt: '2026-03-05T09:00:00Z' },
  { id: '2', userName: 'Konan Marc', action: 'ORDER_VALIDATE', entity: 'Order', details: 'CMD-2026-00567 validée', ipAddress: '192.168.1.15', createdAt: '2026-03-05T08:45:00Z' },
  { id: '3', userName: 'Marie Kouadio', action: 'CLAIM_ASSIGN', entity: 'Claim', details: 'REC-2026-0043 auto-assignée', ipAddress: '192.168.1.20', createdAt: '2026-03-05T08:30:00Z' },
  { id: '4', userName: 'Konan Marc', action: 'STOCK_ENTRY', entity: 'Inventory', details: 'BP-20 : +5000 unités (Réception fabrication)', ipAddress: '192.168.1.15', createdAt: '2026-03-05T08:15:00Z' },
  { id: '5', userName: 'Super Admin', action: 'STAFF_CREATE', entity: 'User', details: 'Nouveau compte : aminata.d@briques.store (ADMIN)', ipAddress: '192.168.1.10', createdAt: '2026-03-04T16:00:00Z' },
  { id: '6', userName: 'Konan Marc', action: 'DRIVER_ASSIGN', entity: 'Order', details: 'CMD-2026-00564 → Koné Ibrahim', ipAddress: '192.168.1.15', createdAt: '2026-03-04T14:00:00Z' },
];

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'users', label: 'Utilisateurs', icon: <Users size={16} /> },
  { key: 'payments', label: 'Paiements', icon: <CreditCard size={16} /> },
  { key: 'delivery', label: 'Livraison', icon: <Truck size={16} /> },
  { key: 'invoicing', label: 'Facturation', icon: <FileText size={16} /> },
  { key: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { key: 'preorders', label: 'Pré-commandes', icon: <ClipboardList size={16} /> },
  { key: 'audit', label: 'Audit', icon: <Shield size={16} /> },
];

function SettingCard({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ToggleSwitch({ enabled }: { enabled: boolean }) {
  return enabled
    ? <ToggleRight size={28} className="text-[#FF8C00] cursor-pointer" />
    : <ToggleLeft size={28} className="text-gray-300 cursor-pointer" />;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres système</h1>
        <p className="text-sm text-gray-500 mt-1">Configuration globale de la plateforme</p>
      </div>

      <div className="flex gap-6">
        {/* Left Nav */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                  activeTab === tab.key
                    ? 'bg-[#FF8C00] text-white'
                    : 'text-gray-600 hover:bg-gray-100',
                )}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Users Management */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Gestion des utilisateurs</h2>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF8C00] text-white text-sm font-medium rounded-lg hover:bg-[#E67E00]">
                  <Plus size={16} /> Nouveau compte
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dernière connexion</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_STAFF.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FF8C00] flex items-center justify-center text-white text-xs font-bold">
                              {u.firstName[0]}{u.lastName[0]}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {ROLE_LABELS[u.role]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-semibold',
                            u.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700',
                          )}>
                            {u.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {u.lastLogin ? formatDateTime(u.lastLogin) : 'Jamais'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Modifier">
                              <Edit size={16} />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Reset password">
                              <Lock size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payments Config */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Configuration des paiements</h2>
              <SettingCard label="Orange Money" description="Via CinetPay / PayDunya">
                <ToggleSwitch enabled={true} />
              </SettingCard>
              <SettingCard label="MTN Money" description="Via CinetPay / PayDunya">
                <ToggleSwitch enabled={true} />
              </SettingCard>
              <SettingCard label="Wave" description="Via Wave Business API">
                <ToggleSwitch enabled={true} />
              </SettingCard>
              <SettingCard label="Carte bancaire (Visa/Mastercard)" description="Via Stripe ou PayDunya">
                <ToggleSwitch enabled={true} />
              </SettingCard>
              <SettingCard label="Virement bancaire" description="Paiement manuel, validation par l'admin">
                <ToggleSwitch enabled={true} />
              </SettingCard>
            </div>
          )}

          {/* Delivery Config */}
          {activeTab === 'delivery' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Configuration de la livraison</h2>
              <SettingCard label="Seuil livraison gratuite" description="Montant minimum pour la livraison gratuite">
                <span className="text-sm font-semibold text-gray-900">5 000 000 FCFA</span>
              </SettingCard>
              <SettingCard label="Délai standard (Abidjan)" description="Nombre de jours ouvrés">
                <span className="text-sm font-semibold text-gray-900">3-5 jours</span>
              </SettingCard>
              <SettingCard label="Délai express (Abidjan)" description="Nombre de jours ouvrés">
                <span className="text-sm font-semibold text-gray-900">1-2 jours</span>
              </SettingCard>
              <SettingCard label="Livraison express activée">
                <ToggleSwitch enabled={true} />
              </SettingCard>
              <SettingCard label="Retrait en entrepôt activé">
                <ToggleSwitch enabled={true} />
              </SettingCard>
            </div>
          )}

          {/* Invoicing Config */}
          {activeTab === 'invoicing' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Configuration de la facturation</h2>
              <SettingCard label="Nom de la société">
                <span className="text-sm font-semibold text-gray-900">BRIQUES.STORE SARL</span>
              </SettingCard>
              <SettingCard label="RCCM">
                <span className="text-sm font-semibold text-gray-900">CI-ABJ-2024-B-12345</span>
              </SettingCard>
              <SettingCard label="Numéro CC">
                <span className="text-sm font-semibold text-gray-900">2024567890 A</span>
              </SettingCard>
              <SettingCard label="Taux TVA">
                <span className="text-sm font-semibold text-gray-900">18%</span>
              </SettingCard>
              <SettingCard label="Préfixe factures">
                <span className="text-sm font-semibold text-gray-900">FACT-{new Date().getFullYear()}-</span>
              </SettingCard>
              <SettingCard label="Durée d'archivage">
                <span className="text-sm font-semibold text-gray-900">10 ans (DGI)</span>
              </SettingCard>
            </div>
          )}

          {/* Notifications Config */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Configuration des notifications</h2>
              <SettingCard label="SMS (confirmation commande)" description="Template avec variables {nom}, {numero_commande}">
                <ToggleSwitch enabled={true} />
              </SettingCard>
              <SettingCard label="WhatsApp (suivi livraison)" description="Via API WhatsApp Business">
                <ToggleSwitch enabled={true} />
              </SettingCard>
              <SettingCard label="Email (facture)" description="Envoi automatique de la facture PDF">
                <ToggleSwitch enabled={true} />
              </SettingCard>
              <SettingCard label="SMS (rappel pré-commande)" description="Envoyé 3 jours avant l'échéance">
                <ToggleSwitch enabled={true} />
              </SettingCard>
              <SettingCard label="Push notifications (back-office)" description="Alertes en temps réel via WebSocket">
                <ToggleSwitch enabled={true} />
              </SettingCard>
            </div>
          )}

          {/* Preorders Config */}
          {activeTab === 'preorders' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Configuration des pré-commandes</h2>
              <SettingCard label="Acompte minimum" description="Pourcentage obligatoire à la souscription">
                <span className="text-sm font-semibold text-gray-900">15%</span>
              </SettingCard>
              <SettingCard label="Durée maximale" description="Durée max du prix bloqué">
                <span className="text-sm font-semibold text-gray-900">12 mois</span>
              </SettingCard>
              <SettingCard label="Pénalité de retard" description="Appliquée sur montants en retard">
                <span className="text-sm font-semibold text-gray-900">5%</span>
              </SettingCard>
              <SettingCard label="Échéances impayées avant suspension" description="Nombre d'échéances consécutives">
                <span className="text-sm font-semibold text-gray-900">2</span>
              </SettingCard>
              <SettingCard label="Délai de grâce" description="Jours après échéance avant pénalité">
                <span className="text-sm font-semibold text-gray-900">7 jours</span>
              </SettingCard>
            </div>
          )}

          {/* Audit Logs */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Journaux d'audit</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Détails</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_AUDIT.map((log) => (
                      <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(log.createdAt)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.userName}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{log.action}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{log.details}</td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
