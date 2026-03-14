import { useState } from 'react';
import {
  TrendingUp, TrendingDown, ShoppingCart, DollarSign,
  Package, Truck, AlertTriangle, Clock, CreditCard, Calendar,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/core/stores/auth.store';
import { formatCFA, formatPercentChange } from '@/core/utils/formatters';

// ─── Mock data ──────────────────────────────────────────────────
const REVENUE_DATA = [
  { day: 'Lun', current: 1250000, previous: 980000 },
  { day: 'Mar', current: 1800000, previous: 1400000 },
  { day: 'Mer', current: 1400000, previous: 1600000 },
  { day: 'Jeu', current: 2100000, previous: 1500000 },
  { day: 'Ven', current: 2800000, previous: 2200000 },
  { day: 'Sam', current: 3200000, previous: 2800000 },
  { day: 'Dim', current: 1500000, previous: 1200000 },
];

const ORDER_STATUS_DATA = [
  { name: 'En attente', value: 12, color: '#FFC107' },
  { name: 'Validées', value: 28, color: '#2196F3' },
  { name: 'En fabrication', value: 15, color: '#FF9800' },
  { name: 'Expédiées', value: 8, color: '#9C27B0' },
  { name: 'Livrées', value: 45, color: '#4CAF50' },
  { name: 'Annulées', value: 3, color: '#F44336' },
];

const TOP_PRODUCTS = [
  { name: 'Brique Pleine 20cm', sold: 12400 },
  { name: 'Brique Creuse 15cm', sold: 9800 },
  { name: 'Hourdis 16cm', sold: 7600 },
  { name: 'Brique Réfractaire', sold: 5200 },
  { name: 'Brique Décorative Rouge', sold: 4100 },
  { name: 'Brique Pleine 15cm', sold: 3800 },
  { name: 'Brique Creuse 20cm', sold: 3200 },
];

const PAYMENT_DATA = [
  { name: 'Orange Money', value: 35, color: '#FF6600' },
  { name: 'MTN Money', value: 25, color: '#FFC107' },
  { name: 'Wave', value: 20, color: '#2196F3' },
  { name: 'Carte bancaire', value: 12, color: '#9C27B0' },
  { name: 'Virement', value: 8, color: '#607D8B' },
];

type Period = 'today' | 'week' | 'month' | 'quarter' | 'year';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: "Aujourd'hui" },
  { key: 'week', label: 'Cette semaine' },
  { key: 'month', label: 'Ce mois' },
  { key: 'quarter', label: 'Ce trimestre' },
  { key: 'year', label: 'Cette année' },
];

// ─── KPI Card ───────────────────────────────────────────────────
function KPICard({ title, value, change, icon, iconBg, suffix }: {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  iconBg: string;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value}
            {suffix && <span className="text-sm font-normal text-gray-500 ml-1">{suffix}</span>}
          </p>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium',
              change >= 0 ? 'text-green-600' : 'text-red-500',
            )}>
              {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {formatPercentChange(change)} vs période préc.
            </div>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Alert Item ─────────────────────────────────────────────────
function AlertItem({ urgency, title, description, action, onClick }: {
  urgency: 'high' | 'medium' | 'info';
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  const colors = {
    high: 'border-l-red-500 bg-red-50/50',
    medium: 'border-l-yellow-500 bg-yellow-50/50',
    info: 'border-l-blue-500 bg-blue-50/50',
  };
  return (
    <div className={cn('border-l-4 rounded-r-lg p-3 flex items-center justify-between', colors[urgency])}>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button onClick={onClick} className="text-xs font-medium text-[#FF8C00] hover:underline whitespace-nowrap ml-4">
        {action}
      </button>
    </div>
  );
}

// ─── Service Client Dashboard ───────────────────────────────────
function ServiceClientDashboard() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Réclamations ouvertes" value="8" suffix="dont 3 non assignées" icon={<AlertTriangle size={20} className="text-red-600" />} iconBg="bg-red-100" />
        <KPICard title="Assignées à moi" value="5" icon={<Package size={20} className="text-blue-600" />} iconBg="bg-blue-100" />
        <KPICard title="Délai moyen traitement" value="18h" suffix="objectif < 24h" icon={<Clock size={20} className="text-yellow-600" />} iconBg="bg-yellow-100" />
        <KPICard title="Résolues ce mois" value="23" change={12.5} icon={<TrendingUp size={20} className="text-green-600" />} iconBg="bg-green-100" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Réclamations prioritaires</h3>
        <div className="space-y-3">
          <AlertItem urgency="high" title="Produit défectueux — CMD-2026-00892" description="Client : Kouassi Jean — Il y a 2h" action="Traiter" onClick={() => {}} />
          <AlertItem urgency="high" title="Articles manquants — CMD-2026-00887" description="Client : Société ABC SARL — Il y a 5h" action="Traiter" onClick={() => {}} />
          <AlertItem urgency="medium" title="Retard livraison — CMD-2026-00875" description="Client : Diallo Mamadou — Il y a 1j" action="Voir" onClick={() => {}} />
        </div>
      </div>
    </>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────
export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('week');
  const user = useAuthStore((s) => s.user);

  if (user?.role === 'SERVICE_CLIENT') {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-1">Bienvenue, {user.firstName} — Service Client</p>
        </div>
        <ServiceClientDashboard />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                period === p.key ? 'bg-[#FF8C00] text-white' : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Chiffre d'affaires"
          value={formatCFA(14050000)}
          change={18.3}
          icon={<DollarSign size={20} className="text-green-600" />}
          iconBg="bg-green-100"
        />
        <KPICard
          title="Commandes du jour"
          value="24"
          suffix="dont 12 à valider"
          icon={<ShoppingCart size={20} className="text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <KPICard
          title="Panier moyen"
          value={formatCFA(585416)}
          change={5.2}
          icon={<CreditCard size={20} className="text-purple-600" />}
          iconBg="bg-purple-100"
        />
        <KPICard
          title="Pré-commandes actives"
          value="18"
          suffix={formatCFA(32400000)}
          icon={<Calendar size={20} className="text-orange-600" />}
          iconBg="bg-orange-100"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Alertes stock"
          value="7"
          suffix="dont 2 critiques 🔴"
          icon={<Package size={20} className="text-yellow-600" />}
          iconBg="bg-yellow-100"
        />
        <KPICard
          title="Livraisons du jour"
          value="15 / 22"
          suffix="effectuées"
          icon={<Truck size={20} className="text-indigo-600" />}
          iconBg="bg-indigo-100"
        />
        <KPICard
          title="Livraisons en retard"
          value="3"
          suffix="depuis 2j en moyenne"
          icon={<Clock size={20} className="text-red-600" />}
          iconBg="bg-red-100"
        />
        <KPICard
          title="Échéances impayées"
          value="5"
          suffix={formatCFA(2750000)}
          icon={<AlertTriangle size={20} className="text-red-600" />}
          iconBg="bg-red-100"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Évolution du CA</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => formatCFA(v)} />
              <Area type="monotone" dataKey="current" stroke="#FF8C00" fill="#FF8C0020" strokeWidth={2} name="Période actuelle" />
              <Area type="monotone" dataKey="previous" stroke="#94a3b8" fill="#94a3b810" strokeWidth={1.5} strokeDasharray="4 4" name="Période précédente" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Donut */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Commandes par statut</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={ORDER_STATUS_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                {ORDER_STATUS_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v} commandes`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
            {ORDER_STATUS_DATA.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600 truncate">{item.name}</span>
                <span className="font-semibold text-gray-900 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Top 7 produits vendus</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={TOP_PRODUCTS} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} unités`} />
              <Bar dataKey="sold" fill="#FF8C00" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Modes de paiement</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={PAYMENT_DATA} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={2}>
                {PAYMENT_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {PAYMENT_DATA.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600 flex-1">{item.name}</span>
                <div className="w-24 bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                </div>
                <span className="font-semibold text-gray-900 w-8 text-right">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Alertes & actions rapides</h3>
        <div className="space-y-3">
          <AlertItem urgency="high" title="Stock critique : Brique Pleine 20cm" description="Seulement 15 unités restantes — seuil critique : 20" action="Voir stock" onClick={() => {}} />
          <AlertItem urgency="high" title="3 livraisons en retard" description="Depuis 2 jours en moyenne — Zone Grand Abidjan" action="Voir planning" onClick={() => {}} />
          <AlertItem urgency="high" title="5 échéances de pré-commande impayées" description="Montant total : 2 750 000 FCFA" action="Voir détails" onClick={() => {}} />
          <AlertItem urgency="medium" title="12 commandes en attente de validation" description="Depuis ce matin — 8 clients particuliers, 4 professionnels" action="Valider" onClick={() => {}} />
          <AlertItem urgency="medium" title="Stock en alerte : Hourdis 16cm" description="85 unités restantes — seuil alerte : 100" action="Voir stock" onClick={() => {}} />
          <AlertItem urgency="info" title="Nouvelle réclamation non assignée" description="Produit défectueux — CMD-2026-00892 — Il y a 2h" action="Assigner" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
}
