import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, MessageCircle, Mail, Send,
  CheckCircle, XCircle, Truck, Clock, FileText,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/core/stores/auth.store';
import { hasPermission } from '@/core/permissions';
import { formatCFA, formatDateTime } from '@/core/utils/formatters';
import {
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
} from '@/core/types';
import type { OrderStatus } from '@/core/types';

// ─── Mock order detail ──────────────────────────────────────────
const MOCK_ORDER = {
  id: '1',
  orderNumber: 'CMD-2026-00567',
  userId: 'u1',
  customerName: 'Kouassi Jean',
  customerPhone: '+225 07 12 34 56',
  customerEmail: 'kouassi@email.com',
  customerType: 'PARTICULIER' as 'PARTICULIER' | 'PROFESSIONNEL',
  status: 'PENDING_VALIDATION' as OrderStatus,
  subtotal: 875000,
  deliveryFee: 15000,
  totalAmount: 1049300,
  amountHt: 889150,
  tva: 160047,
  deliveryMode: 'STANDARD' as 'STANDARD' | 'EXPRESS' | 'PICKUP',
  deliveryAddress: '12 Rue des Jardins, Cocody Angré, Abidjan',
  deliveryNotes: 'Appeler 30 min avant la livraison',
  estimatedDelivery: '2026-03-10T10:00:00Z',
  paymentMethod: 'ORANGE_MONEY' as const,
  paymentStatus: 'CONFIRMED' as const,
  driverName: undefined as string | undefined,
  items: [
    { id: 'i1', productId: 'p1', productName: 'Brique Pleine 20cm', productRef: 'BP-20', quantity: 2000, unitPrice: 350, subtotal: 700000, productImage: undefined },
    { id: 'i2', productId: 'p2', productName: 'Brique Creuse 15cm', productRef: 'BC-15', quantity: 500, unitPrice: 250, subtotal: 125000, productImage: undefined },
    { id: 'i3', productId: 'p3', productName: 'Ciment Multi-usage', productRef: 'CM-01', quantity: 10, unitPrice: 5000, subtotal: 50000, productImage: undefined },
  ],
  timeline: [
    { date: '2026-03-05T08:30:00Z', action: 'Commande créée', author: 'Kouassi Jean (client)', icon: 'create' },
    { date: '2026-03-05T08:31:00Z', action: 'Paiement confirmé via Orange Money', author: 'Système', icon: 'payment' },
  ],
  notes: [
    { id: 'n1', content: 'Client régulier, 3ème commande ce mois.', author: 'Admin', date: '2026-03-05T09:00:00Z' },
  ],
  createdAt: '2026-03-05T08:30:00Z',
  updatedAt: '2026-03-05T08:30:00Z',
};

const STATUS_TRANSITIONS: Record<OrderStatus, { next: OrderStatus; label: string; color: string }[]> = {
  PENDING_VALIDATION: [{ next: 'VALIDATED', label: 'Valider', color: '#2196F3' }],
  VALIDATED: [{ next: 'IN_PREPARATION', label: 'Passer en fabrication', color: '#FF9800' }],
  IN_PREPARATION: [{ next: 'SHIPPED', label: 'Marquer expédiée', color: '#9C27B0' }],
  SHIPPED: [{ next: 'DELIVERED', label: 'Confirmer livraison', color: '#4CAF50' }],
  DELIVERED: [],
  CANCELLED: [],
  RETURNED: [],
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-900 mb-3">{children}</h3>;
}

export default function OrderDetailPage() {
  const params = useParams();
  void params.id; // Will be used with real API
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [newNote, setNewNote] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const order = MOCK_ORDER; // In real app: useQuery
  const canUpdateStatus = user ? hasPermission(user.role, 'orders.update_status') : false;
  const canCancel = user ? hasPermission(user.role, 'orders.cancel') : false;
  const transitions = STATUS_TRANSITIONS[order.status] || [];

  return (
    <div>
      {/* Back button + Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/orders')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: `${ORDER_STATUS_COLORS[order.status]}18`, color: ORDER_STATUS_COLORS[order.status] }}
            >
              <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: ORDER_STATUS_COLORS[order.status] }} />
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Créée le {formatDateTime(order.createdAt)}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {canUpdateStatus && transitions.map((t) => (
            <button
              key={t.next}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: t.color }}
            >
              <CheckCircle size={16} className="inline mr-1.5" />
              {t.label}
            </button>
          ))}
          {canCancel && !['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status) && (
            <button
              onClick={() => setShowCancel(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <XCircle size={16} className="inline mr-1.5" />
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Annuler la commande</h3>
            <p className="text-sm text-gray-500 mb-4">Cette action est irréversible. Veuillez indiquer un motif.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Motif d'annulation..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowCancel(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                Retour
              </button>
              <button
                disabled={!cancelReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Confirmer l'annulation
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <SectionTitle>Informations client</SectionTitle>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                  <span className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded',
                    order.customerType === 'PROFESSIONNEL' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600',
                  )}>
                    {order.customerType === 'PROFESSIONNEL' ? 'PRO' : 'PART'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{order.customerPhone}</p>
                <p className="text-sm text-gray-500">{order.customerEmail}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" title="Appeler">
                  <Phone size={16} />
                </button>
                <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" title="WhatsApp">
                  <MessageCircle size={16} />
                </button>
                <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="SMS">
                  <Send size={16} />
                </button>
                <button className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100" title="Email">
                  <Mail size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <SectionTitle>Produits commandés</SectionTitle>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-semibold text-gray-500">Produit</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-500">Qté</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500">Prix unit.</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF8C00]">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-400">{item.productRef}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center text-sm font-medium text-gray-900">{item.quantity.toLocaleString('fr-FR')}</td>
                    <td className="py-3 text-right text-sm text-gray-600">{formatCFA(item.unitPrice)}</td>
                    <td className="py-3 text-right text-sm font-semibold text-gray-900">{formatCFA(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <SectionTitle>Livraison</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Mode</p>
                <p className="text-sm font-medium text-gray-900">
                  {order.deliveryMode === 'EXPRESS' ? '🚀 Express' : order.deliveryMode === 'PICKUP' ? '📦 Retrait' : '📦 Standard'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Livraison estimée</p>
                <p className="text-sm font-medium text-gray-900">{order.estimatedDelivery ? formatDateTime(order.estimatedDelivery) : '—'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 mb-1">Adresse</p>
                <p className="text-sm font-medium text-gray-900">{order.deliveryAddress || '—'}</p>
              </div>
              {order.deliveryNotes && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Instructions</p>
                  <p className="text-sm text-gray-700">{order.deliveryNotes}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1">Livreur assigné</p>
                <p className="text-sm font-medium text-gray-900">{order.driverName || 'Non assigné'}</p>
                {canUpdateStatus && !order.driverName && order.status === 'IN_PREPARATION' && (
                  <button className="mt-1 text-xs text-[#FF8C00] font-medium hover:underline">
                    <Truck size={12} className="inline mr-1" /> Assigner un livreur
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <SectionTitle>Historique</SectionTitle>
            <div className="space-y-4">
              {order.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock size={14} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.action}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(event.date)} — {event.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <SectionTitle>Notes internes</SectionTitle>
            <div className="space-y-3 mb-4">
              {order.notes.map((note) => (
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
              <button
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-[#FF8C00] text-white text-sm font-medium rounded-lg hover:bg-[#E67E00] disabled:opacity-50 transition-colors"
              >
                <Plus size={16} className="inline mr-1" /> Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Right Column — Financial summary */}
        <div className="space-y-6">
          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <SectionTitle>Paiement</SectionTitle>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Mode</span>
                <span className="text-sm font-medium text-gray-900">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Statut</span>
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: `${PAYMENT_STATUS_COLORS[order.paymentStatus]}18`, color: PAYMENT_STATUS_COLORS[order.paymentStatus] }}
                >
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </span>
              </div>
            </div>
          </div>

          {/* Financial */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <SectionTitle>Récapitulatif</SectionTitle>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total</span>
                <span className="text-gray-900">{formatCFA(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Livraison</span>
                <span className="text-gray-900">{formatCFA(order.deliveryFee)}</span>
              </div>
              {order.amountHt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total HT</span>
                  <span className="text-gray-900">{formatCFA(order.amountHt)}</span>
                </div>
              )}
              {order.tva && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA (18%)</span>
                  <span className="text-gray-900">{formatCFA(order.tva)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-base font-bold text-gray-900">Total TTC</span>
                  <span className="text-base font-bold text-[#FF8C00]">{formatCFA(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <SectionTitle>Documents</SectionTitle>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <FileText size={16} className="text-[#FF8C00]" /> Télécharger la facture
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <FileText size={16} className="text-blue-500" /> Bon de livraison
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
