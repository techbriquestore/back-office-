import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Phone, MessageCircle, Mail, Send,
  UserCheck, CheckCircle, Plus, Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/core/stores/auth.store';
import { hasPermission } from '@/core/permissions';
import { formatDateTime } from '@/core/utils/formatters';
import { CLAIM_TYPE_LABELS, CLAIM_STATUS_LABELS } from '@/core/types';
import type { ClaimStatus, ClaimType } from '@/core/types';

const STATUS_COLORS: Record<ClaimStatus, { bg: string; text: string }> = {
  OPEN: { bg: 'bg-red-50', text: 'text-red-700' },
  IN_PROGRESS: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  RESOLVED: { bg: 'bg-green-50', text: 'text-green-700' },
  CLOSED: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

const MOCK = {
  id: '1',
  number: 'REC-2026-0045',
  orderId: 'o1',
  orderNumber: 'CMD-2026-00892',
  customerId: 'u1',
  customerName: 'Kouassi Jean',
  customerPhone: '+225 07 12 34 56',
  customerEmail: 'kouassi@email.com',
  type: 'DEFECTIVE_PRODUCT' as ClaimType,
  status: 'OPEN' as ClaimStatus,
  description: 'Lot de 200 briques pleines 20cm reçu avec des fissures visibles sur environ 30 unités. Les briques se cassent facilement, qualité non conforme à la commande.',
  assignedTo: undefined as string | undefined,
  assignedToName: undefined as string | undefined,
  photoUrls: ['/placeholder1.jpg', '/placeholder2.jpg'],
  resolution: undefined as string | undefined,
  timeline: [
    { id: 't1', action: 'Réclamation créée par le client', author: 'Kouassi Jean', date: '2026-03-05T07:30:00Z' },
    { id: 't2', action: 'Photo jointe : fissures sur briques', author: 'Kouassi Jean', date: '2026-03-05T07:32:00Z' },
  ],
  internalComments: [
    { id: 'c1', content: 'Vérifier le lot en stock pour confirmer si c\'est un problème de fabrication.', author: 'Konan Marc', date: '2026-03-05T08:00:00Z' },
  ],
  createdAt: '2026-03-05T07:30:00Z',
  updatedAt: '2026-03-05T07:30:00Z',
};

type ResolutionType = 'REFUND' | 'EXCHANGE' | 'CREDIT' | 'GESTURE';
const RESOLUTION_OPTIONS: { value: ResolutionType; label: string }[] = [
  { value: 'REFUND', label: 'Remboursement' },
  { value: 'EXCHANGE', label: 'Échange produit' },
  { value: 'CREDIT', label: 'Avoir sur compte' },
  { value: 'GESTURE', label: 'Geste commercial' },
];

export default function ClaimDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  void params.id;
  const user = useAuthStore((s) => s.user);
  const canResolve = user ? hasPermission(user.role, 'claims.resolve') : false;

  const claim = MOCK;
  const sc = STATUS_COLORS[claim.status];

  const [newComment, setNewComment] = useState('');
  const [showResolve, setShowResolve] = useState(false);
  const [resolutionType, setResolutionType] = useState<ResolutionType>('EXCHANGE');
  const [resolutionNote, setResolutionNote] = useState('');

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/claims')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{claim.number}</h1>
            <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', sc.bg, sc.text)}>
              {CLAIM_STATUS_LABELS[claim.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Ouverte le {formatDateTime(claim.createdAt)}</p>
        </div>
        {canResolve && claim.status !== 'CLOSED' && claim.status !== 'RESOLVED' && (
          <div className="flex items-center gap-2">
            {!claim.assignedTo && (
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100">
                <UserCheck size={16} /> S'assigner
              </button>
            )}
            <button
              onClick={() => setShowResolve(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF8C00] rounded-lg hover:bg-[#E67E00]"
            >
              <CheckCircle size={16} /> Résoudre
            </button>
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {showResolve && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Résoudre la réclamation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de résolution</label>
                <div className="grid grid-cols-2 gap-2">
                  {RESOLUTION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setResolutionType(opt.value)}
                      className={cn(
                        'px-3 py-2 rounded-lg border text-sm font-medium transition-colors text-center',
                        resolutionType === opt.value
                          ? 'border-[#FF8C00] bg-orange-50 text-[#FF8C00]'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Note de résolution</label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={3}
                  placeholder="Détaillez la résolution..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowResolve(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                Annuler
              </button>
              <button
                disabled={!resolutionNote.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-[#FF8C00] rounded-lg hover:bg-[#E67E00] disabled:opacity-50"
              >
                Confirmer la résolution
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Description du problème</h3>
            <p className="text-xs text-gray-400 mb-3">{CLAIM_TYPE_LABELS[claim.type]}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{claim.description}</p>

            {claim.photoUrls.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Photos jointes ({claim.photoUrls.length})</p>
                <div className="flex gap-3">
                  {claim.photoUrls.map((_, i) => (
                    <div key={i} className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <Image size={20} className="text-gray-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Historique</h3>
            <div className="space-y-4">
              {claim.timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#FF8C00] mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.action}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(event.date)} — {event.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internal comments */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Commentaires internes</h3>
            <div className="space-y-3 mb-4">
              {claim.internalComments.map((c) => (
                <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{c.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{c.author} — {formatDateTime(c.date)}</p>
                </div>
              ))}
              {claim.internalComments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Aucun commentaire</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire interne..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none"
              />
              <button
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-[#FF8C00] text-white text-sm font-medium rounded-lg hover:bg-[#E67E00] disabled:opacity-50"
              >
                <Plus size={16} className="inline mr-1" /> Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Order link */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Commande liée</h3>
            <button
              onClick={() => navigate(`/admin/orders/${claim.orderId}`)}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-[#FF8C00] hover:bg-orange-50/30 transition-colors"
            >
              <p className="text-sm font-semibold text-[#FF8C00]">{claim.orderNumber}</p>
              <p className="text-xs text-gray-500 mt-0.5">Cliquez pour voir le détail</p>
            </button>
          </div>

          {/* Client */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Client</h3>
            <div className="space-y-2 text-sm mb-4">
              <p className="font-medium text-gray-900">{claim.customerName}</p>
              <p className="text-gray-500">{claim.customerPhone}</p>
              <p className="text-gray-500">{claim.customerEmail}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" title="Appeler"><Phone size={14} /></button>
              <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" title="WhatsApp"><MessageCircle size={14} /></button>
              <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="SMS"><Send size={14} /></button>
              <button className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100" title="Email"><Mail size={14} /></button>
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Assignation</h3>
            {claim.assignedToName ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                  {claim.assignedToName.split(' ').map((w) => w[0]).join('')}
                </div>
                <span className="text-sm font-medium text-gray-900">{claim.assignedToName}</span>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-sm text-red-500 font-medium mb-2">Non assignée</p>
                {canResolve && (
                  <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF8C00] rounded-lg hover:bg-[#E67E00]">
                    <UserCheck size={16} /> S'assigner
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
