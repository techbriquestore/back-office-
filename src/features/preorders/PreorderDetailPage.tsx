import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Pause, Play, XCircle, CheckCircle, Loader2,
  ShieldCheck, ShieldAlert, ArrowRightCircle, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/core/stores/auth.store';
import { hasPermission } from '@/core/permissions';
import { formatCFA, formatDate, formatDateTime } from '@/core/utils/formatters';
import {
  preordersAdminApi,
  type PreorderDetail,
  type PreorderSchedule,
  type ValidationReport,
} from './services/preorders-admin-api.service';

type ScheduleStatusKey = PreorderSchedule['status'];

const SCHEDULE_STATUS: Record<ScheduleStatusKey, { bg: string; text: string; label: string }> = {
  UPCOMING:  { bg: 'bg-gray-50',   text: 'text-gray-600',   label: 'À venir' },
  DUE:       { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Échue' },
  PAID:      { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Payée' },
  OVERDUE:   { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Impayée' },
  CANCELLED: { bg: 'bg-gray-100',  text: 'text-gray-500',   label: 'Annulée' },
};

const PREORDER_STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE:    { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Active' },
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Terminée — À valider' },
  CONVERTED: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Convertie en commande' },
  SUSPENDED: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Suspendue' },
  CANCELLED: { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Annulée' },
};

export default function PreorderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const authUser = useAuthStore((s) => s.user);
  const canManage = authUser ? hasPermission(authUser.role, 'preorders.manage') : false;

  const [loading, setLoading] = useState(true);
  const [preorder, setPreorder] = useState<PreorderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validation state
  const [validating, setValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertResult, setConvertResult] = useState<string | null>(null);

  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const loadPreorder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await preordersAdminApi.getPreorder(id);
      setPreorder(data);
    } catch (err: any) {
      setError(err.message || 'Impossible de charger la pré-commande');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPreorder();
  }, [loadPreorder]);

  const handleValidate = async () => {
    if (!id) return;
    setValidating(true);
    setValidationReport(null);
    try {
      const report = await preordersAdminApi.validate(id);
      setValidationReport(report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setValidating(false);
    }
  };

  const handleConvert = async () => {
    if (!id) return;
    setConverting(true);
    setConvertResult(null);
    try {
      const result = await preordersAdminApi.convertToOrder(id);
      setConvertResult(result.message);
      await loadPreorder();
      setValidationReport(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConverting(false);
    }
  };

  const handleAction = async (action: 'suspend' | 'reactivate' | 'cancel') => {
    if (!id) return;
    
    if (action === 'cancel') {
      setShowCancelModal(true);
      return;
    }
    
    setActionLoading(action);
    try {
      if (action === 'suspend') await preordersAdminApi.suspend(id);
      if (action === 'reactivate') await preordersAdminApi.reactivate(id);
      await loadPreorder();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!id || !cancelReason.trim()) {
      setError('Veuillez indiquer une raison pour l\'annulation');
      return;
    }
    
    setActionLoading('cancel');
    try {
      await preordersAdminApi.cancel(id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      await loadPreorder();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#FF8C00]" size={40} />
      </div>
    );
  }

  if (error && !preorder) {
    return (
      <div className="text-center py-24">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={loadPreorder} className="text-[#FF8C00] font-medium hover:underline">Réessayer</button>
      </div>
    );
  }

  if (!preorder) return null;

  const statusCfg = PREORDER_STATUS_CONFIG[preorder.status] || PREORDER_STATUS_CONFIG.ACTIVE;
  const progress = preorder.totalSchedules > 0
    ? Math.round((preorder.paidSchedules / preorder.totalSchedules) * 100)
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/preorders')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Pré-commande</h1>
            <span className={cn('inline-flex px-3 py-1 rounded-full text-xs font-semibold', statusCfg.bg, statusCfg.text)}>
              {statusCfg.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Créée le {formatDate(preorder.createdAt)} — ID: {preorder.id.substring(0, 8).toUpperCase()}
          </p>
        </div>
        {canManage && preorder.status === 'ACTIVE' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction('suspend')}
              disabled={actionLoading === 'suspend'}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-50"
            >
              <Pause size={16} /> Suspendre
            </button>
            <button
              onClick={() => handleAction('cancel')}
              disabled={actionLoading === 'cancel'}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
            >
              <XCircle size={16} /> Annuler
            </button>
          </div>
        )}
        {canManage && preorder.status === 'SUSPENDED' && (
          <button
            onClick={() => handleAction('reactivate')}
            disabled={actionLoading === 'reactivate'}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50"
          >
            <Play size={16} /> Réactiver
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Fermer</button>
        </div>
      )}

      {/* Convert success banner */}
      {convertResult && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 font-semibold">
            <CheckCircle size={20} /> {convertResult}
          </div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="mt-2 text-sm text-green-600 hover:underline font-medium"
          >
            Voir les commandes →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Résumé</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Client</p>
                <p className="text-sm font-medium text-gray-900">{preorder.user.firstName} {preorder.user.lastName}</p>
                <p className="text-xs text-gray-400">{preorder.user.phone || preorder.user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Prix bloqué</p>
                <p className="text-sm font-medium text-gray-900">{formatCFA(preorder.lockedPrice)}/u</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Quantité totale</p>
                <p className="text-sm font-bold text-gray-900">{preorder.totalQuantity.toLocaleString('fr-FR')} unités</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Montant total</p>
                <p className="text-sm font-bold text-[#FF8C00]">{formatCFA(preorder.totalAmount)}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Progression du paiement</span>
                <span className="font-semibold text-gray-900">
                  {formatCFA(preorder.amountPaid)} / {formatCFA(preorder.totalAmount)} ({progress}%)
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', progress >= 100 ? 'bg-green-500' : 'bg-[#FF8C00]')}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                <span>{preorder.paidSchedules}/{preorder.totalSchedules} échéances payées</span>
                <span>Reste : {formatCFA(preorder.remaining)}</span>
              </div>
            </div>
          </div>

          {/* ═══════ VALIDATION PANEL (only for COMPLETED) ═══════ */}
          {canManage && preorder.status === 'COMPLETED' && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck size={24} className="text-[#FF8C00]" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">Validation requise</h3>
                  <p className="text-sm text-orange-700">Toutes les échéances sont payées. Vérifiez avant de convertir en commande.</p>
                </div>
              </div>

              {!validationReport && (
                <button
                  onClick={handleValidate}
                  disabled={validating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#FF8C00] rounded-lg hover:bg-[#E67E00] disabled:opacity-50"
                >
                  {validating ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  Lancer les vérifications anti-fraude
                </button>
              )}

              {validationReport && (
                <div className="mt-4 space-y-3">
                  {/* Check results */}
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    {validationReport.checks.map((check, i) => (
                      <div key={i} className="flex items-start gap-3 py-1">
                        {check.passed ? (
                          <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                        ) : (
                          <ShieldAlert size={18} className="text-red-500 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className={cn('text-sm font-medium', check.passed ? 'text-gray-900' : 'text-red-700')}>
                            {check.label}
                          </p>
                          <p className="text-xs text-gray-500">{check.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="bg-white rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{formatCFA(validationReport.summary.totalPaid)}</p>
                      <p className="text-xs text-gray-500">Total payé</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{validationReport.summary.paidCount}</p>
                      <p className="text-xs text-gray-500">Échéances payées</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{validationReport.summary.customer}</p>
                      <p className="text-xs text-gray-500">Client</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{validationReport.summary.product}</p>
                      <p className="text-xs text-gray-500">Produit</p>
                    </div>
                  </div>

                  {/* Action button */}
                  {validationReport.canConvert ? (
                    <button
                      onClick={handleConvert}
                      disabled={converting}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {converting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRightCircle size={18} />}
                      Convertir en commande
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <AlertTriangle size={16} />
                      <span>Conversion impossible — des vérifications ont échoué.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Converted banner */}
          {preorder.status === 'CONVERTED' && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex items-center gap-3">
              <CheckCircle size={24} className="text-purple-600" />
              <div>
                <p className="font-semibold text-purple-900">Pré-commande convertie en commande</p>
                <p className="text-sm text-purple-700">La commande a été créée et est visible dans la section Commandes.</p>
              </div>
            </div>
          )}

          {/* Échéancier */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Échéancier détaillé</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">N°</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date prévue</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Quantité</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date paiement</th>
                  </tr>
                </thead>
                <tbody>
                  {preorder.schedules.map((s, i) => {
                    const cfg = SCHEDULE_STATUS[s.status] || SCHEDULE_STATUS.UPCOMING;
                    return (
                      <tr key={s.id} className={cn('border-b border-gray-50 hover:bg-gray-50/50', s.status === 'OVERDUE' && 'bg-red-50/30')}>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">Tranche {i + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(s.dueDate)}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatCFA(s.amount)}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{s.quantity.toLocaleString('fr-FR')}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', cfg.bg, cfg.text)}>
                            {s.status === 'PAID' && <CheckCircle size={12} className="mr-1" />}
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {s.paidAt ? formatDateTime(s.paidAt) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Dates clés</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Début</span>
                <span className="font-medium text-gray-900">{formatDate(preorder.startDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fin</span>
                <span className="font-medium text-gray-900">{formatDate(preorder.endDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Création</span>
                <span className="font-medium text-gray-900">{formatDate(preorder.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Contact client</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700 font-medium">{preorder.user.firstName} {preorder.user.lastName}</p>
              {preorder.user.phone && <p className="text-gray-500">{preorder.user.phone}</p>}
              {preorder.user.email && <p className="text-gray-500">{preorder.user.email}</p>}
            </div>
          </div>

          {canManage && preorder.status === 'ACTIVE' && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Actions admin</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleAction('suspend')}
                  disabled={actionLoading === 'suspend'}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-50"
                >
                  <Pause size={16} /> Suspendre
                </button>
                <button
                  onClick={() => handleAction('cancel')}
                  disabled={actionLoading === 'cancel'}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle size={16} /> Annuler la pré-commande
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ CANCEL CONFIRMATION MODAL ═══════ */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Annuler la pré-commande</h3>
                <p className="text-sm text-gray-500">Cette action est irréversible</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">
                <strong>Attention :</strong> L'annulation bloquera tous les paiements en cours et nécessitera un remboursement si des échéances ont déjà été payées.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raison de l'annulation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Expliquez pourquoi cette pré-commande est annulée..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={actionLoading === 'cancel' || !cancelReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === 'cancel' ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                Confirmer l'annulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
