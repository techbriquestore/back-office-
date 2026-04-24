import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, MessageCircle, Mail, Send,
  CheckCircle, XCircle, Truck, Clock, FileText,
  Plus, Loader2, AlertTriangle,
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
import { ordersApiService, type Order } from './services/orders-api.service';

const STATUS_TRANSITIONS: Record<string, { next: OrderStatus; label: string; color: string }[]> = {
  PENDING_VALIDATION: [{ next: 'VALIDATED', label: 'Valider la commande', color: '#2196F3' }],
  VALIDATED: [{ next: 'IN_PREPARATION', label: 'Lancer la fabrication', color: '#FF9800' }],
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApiService.getOrder(id);
      setOrder(data);
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger la commande');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  const canUpdateStatus = user ? hasPermission(user.role, 'orders.update_status') : false;
  const canCancel = user ? hasPermission(user.role, 'orders.cancel') : false;

  const handleStatusUpdate = async (nextStatus: OrderStatus) => {
    if (!order) return;
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const updated = await ordersApiService.updateOrderStatus(order.id, nextStatus);
      setOrder(updated);
      setSuccessMsg(`Statut mis à jour : ${ORDER_STATUS_LABELS[nextStatus] || nextStatus}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur lors de la mise à jour du statut');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const updated = await ordersApiService.cancelOrder(order.id, cancelReason);
      setOrder(updated);
      setShowCancel(false);
      setCancelReason('');
      setSuccessMsg('Commande annulée');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur lors de l\'annulation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!order || !newNote.trim()) return;
    setAddingNote(true);
    try {
      await ordersApiService.addNote(order.id, newNote.trim());
      setNewNote('');
      await loadOrder();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur lors de l\'ajout de la note');
    } finally {
      setAddingNote(false);
    }
  };

  // ─── Loading / Error ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-gray-400" size={32} />
        <span className="ml-3 text-gray-500">Chargement…</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertTriangle size={40} className="text-red-400" />
        <p className="text-gray-600">{error || 'Commande introuvable'}</p>
        <button onClick={() => navigate('/admin/orders')} className="text-sm text-[#FF8C00] font-medium hover:underline">
          Retour aux commandes
        </button>
      </div>
    );
  }

  const transitions = STATUS_TRANSITIONS[order.status] || [];
  const customerName = order.user ? `${order.user.firstName} ${order.user.lastName}` : '—';
  const customerPhone = order.user?.phone || '—';
  const customerEmail = order.user?.email || '—';
  const deliveryAddress = (order as any).deliveryAddress;
  const addressStr = deliveryAddress
    ? `${deliveryAddress.fullAddress || ''}${deliveryAddress.city ? ', ' + deliveryAddress.city : ''}`
    : '—';
  const driverName = (order as any).driver
    ? `${(order as any).driver.firstName} ${(order as any).driver.lastName}`
    : undefined;

  return (
    <div>
      {/* Success / Error banners */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-sm text-green-700">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-600" />
          <span className="text-sm text-red-700">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
        </div>
      )}

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
              style={{ backgroundColor: `${ORDER_STATUS_COLORS[order.status as OrderStatus] || '#666'}18`, color: ORDER_STATUS_COLORS[order.status as OrderStatus] || '#666' }}
            >
              <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: ORDER_STATUS_COLORS[order.status as OrderStatus] || '#666' }} />
              {ORDER_STATUS_LABELS[order.status as OrderStatus] || order.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Créée le {formatDateTime(order.createdAt)}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {canUpdateStatus && transitions.map((t) => (
            <button
              key={t.next}
              disabled={actionLoading}
              onClick={() => handleStatusUpdate(t.next)}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
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
                disabled={!cancelReason.trim() || actionLoading}
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin inline mr-1" /> : null}
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
                <p className="font-medium text-gray-900">{customerName}</p>
                <p className="text-sm text-gray-500">{customerPhone}</p>
                <p className="text-sm text-gray-500">{customerEmail}</p>
              </div>
              <div className="flex items-center gap-2">
                {customerPhone !== '—' && (
                  <>
                    <a href={`tel:${customerPhone}`} className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" title="Appeler">
                      <Phone size={16} />
                    </a>
                    <a href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" title="WhatsApp">
                      <MessageCircle size={16} />
                    </a>
                  </>
                )}
                {customerEmail !== '—' && (
                  <a href={`mailto:${customerEmail}`} className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100" title="Email">
                    <Mail size={16} />
                  </a>
                )}
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
                          <p className="text-sm font-medium text-gray-900">{item.product?.name || '—'}</p>
                          <p className="text-xs text-gray-400">{item.product?.reference || ''}</p>
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
                  {order.deliveryMode === 'EXPRESS' ? 'Express' : order.deliveryMode === 'PICKUP' ? 'Retrait' : 'Standard'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Livraison estimée</p>
                <p className="text-sm font-medium text-gray-900">{order.estimatedDelivery ? formatDateTime(order.estimatedDelivery) : '—'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 mb-1">Adresse</p>
                <p className="text-sm font-medium text-gray-900">{addressStr}</p>
              </div>
              {order.deliveryNotes && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Instructions</p>
                  <p className="text-sm text-gray-700">{order.deliveryNotes}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1">Livreur assigné</p>
                <p className="text-sm font-medium text-gray-900">{driverName || 'Non assigné'}</p>
                {canUpdateStatus && !driverName && order.status === 'IN_PREPARATION' && (
                  <button className="mt-1 text-xs text-[#FF8C00] font-medium hover:underline">
                    <Truck size={12} className="inline mr-1" /> Assigner un livreur
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <SectionTitle>Notes internes</SectionTitle>
            <div className="space-y-3 mb-4">
              {(order as any).notes?.length > 0 ? (
                (order as any).notes.map((note: any) => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(note.createdAt)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">Aucune note pour cette commande</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Ajouter une note..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none"
              />
              <button
                disabled={!newNote.trim() || addingNote}
                onClick={handleAddNote}
                className="px-4 py-2 bg-[#FF8C00] text-white text-sm font-medium rounded-lg hover:bg-[#E67E00] disabled:opacity-50 transition-colors"
              >
                {addingNote ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} className="inline mr-1" />}
                {!addingNote && 'Ajouter'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column — Financial summary */}
        <div className="space-y-6">
          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <SectionTitle>Paiements</SectionTitle>
            {order.payments && order.payments.length > 0 ? (
              <div className="space-y-3">
                {order.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatCFA(p.amount)}</p>
                      <p className="text-xs text-gray-500">{PAYMENT_METHOD_LABELS[p.method] || p.method}</p>
                    </div>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${PAYMENT_STATUS_COLORS[p.status] || '#666'}18`, color: PAYMENT_STATUS_COLORS[p.status] || '#666' }}
                    >
                      {PAYMENT_STATUS_LABELS[p.status] || p.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucun paiement enregistré</p>
            )}
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
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-base font-bold text-gray-900">Total</span>
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
