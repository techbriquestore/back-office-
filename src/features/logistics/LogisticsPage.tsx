import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Users, MapPin, Calendar, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatCFA } from '@/core/utils/formatters';

type Tab = 'planning' | 'drivers' | 'zones';

interface DeliveryRow {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  zone: string;
  driverName?: string;
  estimatedDate: string;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'LATE';
}

const MOCK_DELIVERIES: DeliveryRow[] = [
  { id: '1', orderNumber: 'CMD-2026-00567', customerName: 'Kouassi Jean', address: 'Cocody Angré', zone: 'Abidjan intra-muros', driverName: 'Koné Ibrahim', estimatedDate: '2026-03-05', status: 'IN_TRANSIT' },
  { id: '2', orderNumber: 'CMD-2026-00564', customerName: 'Traoré Fatoumata', address: 'Yopougon Maroc', zone: 'Abidjan intra-muros', driverName: 'Koné Ibrahim', estimatedDate: '2026-03-05', status: 'DELIVERED' },
  { id: '3', orderNumber: 'CMD-2026-00560', customerName: 'Koffi Emmanuel', address: 'Abobo Gare', zone: 'Grand Abidjan', driverName: 'Touré Ali', estimatedDate: '2026-03-05', status: 'SCHEDULED' },
  { id: '4', orderNumber: 'CMD-2026-00555', customerName: 'Bamba Seydou', address: 'Bouaké Centre', zone: 'Villes intérieur', estimatedDate: '2026-03-03', status: 'LATE' },
  { id: '5', orderNumber: 'CMD-2026-00550', customerName: 'Société BTP Plus', address: 'Marcory Zone 4', zone: 'Abidjan intra-muros', driverName: 'Diarra Moussa', estimatedDate: '2026-03-06', status: 'SCHEDULED' },
];

interface DriverRow {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  capacity: string;
  zones: string[];
  isActive: boolean;
  currentDeliveries: number;
}

const MOCK_DRIVERS: DriverRow[] = [
  { id: '1', name: 'Koné Ibrahim', phone: '+225 07 55 66 77', vehicleType: 'Camion 10T', capacity: '10 tonnes', zones: ['Abidjan intra-muros', 'Grand Abidjan'], isActive: true, currentDeliveries: 2 },
  { id: '2', name: 'Touré Ali', phone: '+225 05 44 33 22', vehicleType: 'Camion 5T', capacity: '5 tonnes', zones: ['Abidjan intra-muros'], isActive: true, currentDeliveries: 1 },
  { id: '3', name: 'Diarra Moussa', phone: '+225 01 88 99 00', vehicleType: 'Camion 15T', capacity: '15 tonnes', zones: ['Abidjan intra-muros', 'Grand Abidjan', 'Villes intérieur'], isActive: true, currentDeliveries: 1 },
  { id: '4', name: 'Coulibaly Adama', phone: '+225 07 11 22 33', vehicleType: 'Pick-up', capacity: '2 tonnes', zones: ['Abidjan intra-muros'], isActive: false, currentDeliveries: 0 },
];

interface ZoneRow {
  id: string;
  name: string;
  baseFee: number;
  standardDays: number;
  expressDays: number;
  isActive: boolean;
}

const MOCK_ZONES: ZoneRow[] = [
  { id: '1', name: 'Abidjan intra-muros', baseFee: 15000, standardDays: 3, expressDays: 1, isActive: true },
  { id: '2', name: 'Grand Abidjan', baseFee: 25000, standardDays: 5, expressDays: 2, isActive: true },
  { id: '3', name: 'Bouaké', baseFee: 45000, standardDays: 7, expressDays: 3, isActive: true },
  { id: '4', name: 'Yamoussoukro', baseFee: 40000, standardDays: 7, expressDays: 3, isActive: true },
  { id: '5', name: 'San Pedro', baseFee: 55000, standardDays: 7, expressDays: 4, isActive: true },
  { id: '6', name: 'Korhogo', baseFee: 60000, standardDays: 10, expressDays: 5, isActive: true },
  { id: '7', name: 'Zones rurales', baseFee: 0, standardDays: 0, expressDays: 0, isActive: false },
];

const DELIVERY_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  SCHEDULED: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Planifiée' },
  IN_TRANSIT: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'En cours' },
  DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', label: 'Livrée' },
  LATE: { bg: 'bg-red-50', text: 'text-red-700', label: 'En retard' },
};

export default function LogisticsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('planning');

  const lateCount = MOCK_DELIVERIES.filter((d) => d.status === 'LATE').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logistique</h1>
          <p className="text-sm text-gray-500 mt-1">Planning des livraisons, livreurs & zones</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        {([
          { key: 'planning' as Tab, label: 'Planning livraisons', icon: <Calendar size={16} /> },
          { key: 'drivers' as Tab, label: 'Livreurs', icon: <Users size={16} /> },
          { key: 'zones' as Tab, label: 'Zones & tarifs', icon: <MapPin size={16} /> },
        ]).map((tab) => (
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

      {/* Planning Tab */}
      {activeTab === 'planning' && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Livraisons du jour</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{MOCK_DELIVERIES.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">En cours</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{MOCK_DELIVERIES.filter((d) => d.status === 'IN_TRANSIT').length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Complétées</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{MOCK_DELIVERIES.filter((d) => d.status === 'DELIVERED').length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">En retard</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{lateCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Commande</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Adresse</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Zone</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Livreur</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date prévue</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DELIVERIES.map((d) => {
                    const st = DELIVERY_STATUS[d.status];
                    return (
                      <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <button onClick={() => navigate(`/admin/orders/${d.id}`)} className="text-sm font-semibold text-[#FF8C00] hover:underline">
                            {d.orderNumber}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.customerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{d.address}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{d.zone}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {d.driverName || <span className="text-red-500 text-xs font-medium">Non assigné</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(d.estimatedDate)}</td>
                        <td className="px-4 py-3 text-center">
                          {st && (
                            <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-semibold', st.bg, st.text)}>
                              {st.label}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#FF8C00] bg-orange-50 rounded-lg hover:bg-orange-100">
                            <Eye size={14} /> Détails
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Drivers Tab */}
      {activeTab === 'drivers' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Livreur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Téléphone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Véhicule</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Capacité</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Zones</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">En cours</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DRIVERS.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Truck size={14} />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{d.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{d.vehicleType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{d.capacity}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {d.zones.map((z) => (
                          <span key={z} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{z}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">{d.currentDeliveries}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-semibold',
                        d.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500',
                      )}>
                        {d.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Zones Tab */}
      {activeTab === 'zones' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Zone</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tarif base</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Délai standard</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Délai express</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ZONES.map((z) => (
                  <tr key={z.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#FF8C00]" />
                        <span className="text-sm font-medium text-gray-900">{z.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {z.baseFee > 0 ? formatCFA(z.baseFee) : 'Sur devis'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {z.standardDays > 0 ? `${z.standardDays} jours` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {z.expressDays > 0 ? `${z.expressDays} jours` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-semibold',
                        z.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500',
                      )}>
                        {z.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
