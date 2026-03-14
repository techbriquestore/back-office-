import { useState } from 'react';
import { Download, FileText, BarChart3, Package, Truck } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import { formatCFA } from '@/core/utils/formatters';

type Tab = 'commercial' | 'stock' | 'logistics';

const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 45000000 },
  { month: 'Fév', revenue: 52000000 },
  { month: 'Mar', revenue: 48000000 },
  { month: 'Avr', revenue: 61000000 },
  { month: 'Mai', revenue: 55000000 },
  { month: 'Jun', revenue: 72000000 },
];

const SALES_BY_PRODUCT = [
  { name: 'Brique Pleine 20cm', revenue: 32000000, quantity: 91400 },
  { name: 'Brique Creuse 15cm', revenue: 18000000, quantity: 72000 },
  { name: 'Hourdis 16cm', revenue: 15000000, quantity: 33333 },
  { name: 'Brique Réfractaire', revenue: 12000000, quantity: 10000 },
  { name: 'Brique Décorative', revenue: 8000000, quantity: 10000 },
];

const SALES_BY_ZONE = [
  { name: 'Abidjan intra', value: 45, color: '#FF8C00' },
  { name: 'Grand Abidjan', value: 25, color: '#2196F3' },
  { name: 'Bouaké', value: 12, color: '#4CAF50' },
  { name: 'Yamoussoukro', value: 8, color: '#9C27B0' },
  { name: 'Autres', value: 10, color: '#607D8B' },
];

const STOCK_ROTATION = [
  { name: 'BP-20', rotation: 4.2, avgDays: 21 },
  { name: 'BC-15', rotation: 3.8, avgDays: 25 },
  { name: 'HD-16', rotation: 3.1, avgDays: 30 },
  { name: 'BR-01', rotation: 1.5, avgDays: 60 },
  { name: 'BD-R1', rotation: 2.0, avgDays: 45 },
];

const DELIVERY_PERF = [
  { month: 'Jan', onTime: 92, late: 8 },
  { month: 'Fév', onTime: 88, late: 12 },
  { month: 'Mar', onTime: 95, late: 5 },
  { month: 'Avr', onTime: 90, late: 10 },
  { month: 'Mai', onTime: 93, late: 7 },
  { month: 'Jun', onTime: 96, late: 4 },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('commercial');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'commercial', label: 'Rapports commerciaux', icon: <BarChart3 size={16} /> },
    { key: 'stock', label: 'Rapports stocks', icon: <Package size={16} /> },
    { key: 'logistics', label: 'Rapports logistique', icon: <Truck size={16} /> },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Statistiques</h1>
          <p className="text-sm text-gray-500 mt-1">Analyses détaillées de votre activité</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download size={16} /> Export Excel
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.key
                ? 'border-[#FF8C00] text-[#FF8C00]'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Commercial */}
      {activeTab === 'commercial' && (
        <div className="space-y-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Chiffre d'affaires mensuel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MONTHLY_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(v) => formatCFA(Number(v))} />
                <Bar dataKey="revenue" fill="#FF8C00" radius={[4, 4, 0, 0]} barSize={40} name="CA" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Product */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Ventes par produit</h3>
              <div className="space-y-3">
                {SALES_BY_PRODUCT.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 w-40 truncate">{p.name}</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF8C00] rounded-full"
                        style={{ width: `${(p.revenue / SALES_BY_PRODUCT[0]!.revenue) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-32 text-right">{formatCFA(p.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales by Zone */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Répartition par zone</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={SALES_BY_ZONE} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={2}>
                    {SALES_BY_ZONE.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {SALES_BY_ZONE.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 flex-1">{item.name}</span>
                    <span className="font-semibold text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Rotation des stocks</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Produit</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Taux de rotation</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Jours moy. en stock</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {STOCK_ROTATION.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.name}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{r.rotation}x</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">{r.avgDays} jours</td>
                      <td className="px-4 py-3 text-center">
                        <div className="w-24 mx-auto h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', r.rotation >= 3 ? 'bg-green-500' : r.rotation >= 2 ? 'bg-yellow-500' : 'bg-red-500')}
                            style={{ width: `${Math.min(100, (r.rotation / 5) * 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Logistics */}
      {activeTab === 'logistics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Ponctualité des livraisons (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={DELIVERY_PERF}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Line type="monotone" dataKey="onTime" stroke="#4CAF50" strokeWidth={2} name="À l'heure" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="late" stroke="#F44336" strokeWidth={2} name="En retard" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
