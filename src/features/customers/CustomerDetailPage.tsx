import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, Mail, Send, Plus, ShoppingCart, AlertTriangle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCFA, formatDate, formatDateTime } from '@/core/utils/formatters';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/core/types';
import type { OrderStatus } from '@/core/types';

const MOCK = {
  id: '1',
  firstName: 'Kouassi',
  lastName: 'Jean',
  phone: '+225 07 12 34 56',
  email: 'kouassi@email.com',
  clientType: 'PARTICULIER' as 'PARTICULIER' | 'PROFESSIONNEL',
  companyName: undefined as string | undefined,
  totalOrders: 12,
  totalRevenue: 8500000,
  averageBasket: 708333,
  lastOrderDate: '2026-03-05',
  createdAt: '2025-06-15',
  addresses: [
    { id: 'a1', label: 'Domicile', fullAddress: '12 Rue des Jardins, Cocody Angré, Abidjan', isDefault: true },
    { id: 'a2', label: 'Chantier Riviera', fullAddress: 'Lot 45, Riviera Faya, Abidjan', isDefault: false },
  ],
  recentOrders: [
    { id: 'o1', orderNumber: 'CMD-2026-00567', totalAmount: 1049300, status: 'PENDING_VALIDATION' as OrderStatus, createdAt: '2026-03-05T08:30:00Z' },
    { id: 'o2', orderNumber: 'CMD-2026-00510', totalAmount: 720000, status: 'DELIVERED' as OrderStatus, createdAt: '2026-02-20T10:00:00Z' },
    { id: 'o3', orderNumber: 'CMD-2026-00480', totalAmount: 1550000, status: 'DELIVERED' as OrderStatus, createdAt: '2026-02-05T14:00:00Z' },
    { id: 'o4', orderNumber: 'CMD-2026-00420', totalAmount: 350000, status: 'DELIVERED' as OrderStatus, createdAt: '2026-01-18T09:00:00Z' },
    { id: 'o5', orderNumber: 'CMD-2025-01250', totalAmount: 2200000, status: 'DELIVERED' as OrderStatus, createdAt: '2025-12-10T11:00:00Z' },
  ],
  claims: [
    { id: 'c1', number: 'REC-2026-0020', type: 'Retard livraison', status: 'Résolue', createdAt: '2026-02-22' },
  ],
  notes: [
    { id: 'n1', content: 'Client fidèle, toujours ponctuel dans ses paiements.', author: 'Konan Marc', date: '2026-01-20T10:00:00Z' },
    { id: 'n2', content: 'Préfère être contacté par WhatsApp.', author: 'Marie K.', date: '2026-02-15T14:00:00Z' },
  ],
};

export default function CustomerDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  void params.id;
  const [newNote, setNewNote] = useState('');

  const customer = MOCK;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/customers')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FF8C00] flex items-center justify-center text-white text-lg font-bold">
              {customer.firstName[0]}{customer.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{customer.firstName} {customer.lastName}</h1>
                <span className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded',
                  customer.clientType === 'PROFESSIONNEL' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600',
                )}>
                  {customer.clientType === 'PROFESSIONNEL' ? 'PRO' : 'PARTICULIER'}
                </span>
              </div>
              <p className="text-sm text-gray-500">Client depuis le {formatDate(customer.createdAt)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" title="Appeler"><Phone size={18} /></button>
          <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" title="WhatsApp"><MessageCircle size={18} /></button>
          <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="SMS"><Send size={18} /></button>
          <button className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100" title="Email"><Mail size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500">Commandes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{customer.totalOrders}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500">CA Total</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCFA(customer.totalRevenue)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500">Panier moyen</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCFA(customer.averageBasket)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500">Dernière commande</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{customer.lastOrderDate ? formatDate(customer.lastOrderDate) : '—'}</p>
            </div>
          </div>

          {/* Orders history */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={18} className="text-[#FF8C00]" />
              <h3 className="text-base font-semibold text-gray-900">Historique des commandes</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">N° commande</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody>
                {customer.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-3 py-2.5">
                      <button onClick={() => navigate(`/admin/orders/${o.id}`)} className="text-sm font-semibold text-[#FF8C00] hover:underline">
                        {o.orderNumber}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-600">{formatDateTime(o.createdAt)}</td>
                    <td className="px-3 py-2.5 text-right text-sm font-medium text-gray-900">{formatCFA(o.totalAmount)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ backgroundColor: `${ORDER_STATUS_COLORS[o.status]}18`, color: ORDER_STATUS_COLORS[o.status] }}
                      >
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Claims */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-yellow-500" />
              <h3 className="text-base font-semibold text-gray-900">Réclamations</h3>
            </div>
            {customer.claims.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Aucune réclamation</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">N°</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.claims.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50">
                      <td className="px-3 py-2.5 text-sm font-semibold text-gray-900">{c.number}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-700">{c.type}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700">{c.status}</span>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Notes internes</h3>
            <div className="space-y-3 mb-4">
              {customer.notes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{note.author} — {formatDateTime(note.date)}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ajouter une note..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none"
              />
              <button disabled={!newNote.trim()} className="px-4 py-2 bg-[#FF8C00] text-white text-sm font-medium rounded-lg hover:bg-[#E67E00] disabled:opacity-50">
                <Plus size={16} className="inline mr-1" /> Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Contact info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Informations</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Téléphone :</span> <span className="font-medium text-gray-900">{customer.phone}</span></div>
              <div><span className="text-gray-500">Email :</span> <span className="font-medium text-gray-900">{customer.email || '—'}</span></div>
              <div><span className="text-gray-500">Type :</span> <span className="font-medium text-gray-900">{customer.clientType === 'PROFESSIONNEL' ? 'Professionnel' : 'Particulier'}</span></div>
              {customer.companyName && (
                <div><span className="text-gray-500">Entreprise :</span> <span className="font-medium text-gray-900">{customer.companyName}</span></div>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-[#FF8C00]" />
              <h3 className="text-base font-semibold text-gray-900">Adresses</h3>
            </div>
            <div className="space-y-3">
              {customer.addresses.map((addr) => (
                <div key={addr.id} className={cn('p-3 rounded-lg border', addr.isDefault ? 'border-[#FF8C00] bg-orange-50/30' : 'border-gray-200')}>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{addr.label}</p>
                    {addr.isDefault && <span className="text-[10px] font-bold text-[#FF8C00] bg-orange-100 px-1.5 py-0.5 rounded">Par défaut</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{addr.fullAddress}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
