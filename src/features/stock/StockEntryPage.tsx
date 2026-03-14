import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

type EntryReason = 'RECEPTION_FABRICATION' | 'RECEPTION_FOURNISSEUR' | 'RETOUR_CLIENT';

const REASONS: { value: EntryReason; label: string }[] = [
  { value: 'RECEPTION_FABRICATION', label: 'Réception fabrication' },
  { value: 'RECEPTION_FOURNISSEUR', label: 'Réception fournisseur' },
  { value: 'RETOUR_CLIENT', label: 'Retour client' },
];

const PRODUCTS = [
  { id: '1', label: 'Brique Pleine 20cm (BP-20)' },
  { id: '2', label: 'Brique Pleine 15cm (BP-15)' },
  { id: '3', label: 'Brique Creuse 15cm (BC-15)' },
  { id: '4', label: 'Brique Creuse 20cm (BC-20)' },
  { id: '5', label: 'Brique Réfractaire (BR-01)' },
  { id: '6', label: 'Brique Décorative Rouge (BD-R1)' },
  { id: '7', label: 'Hourdis 16cm (HD-16)' },
];

export default function StockEntryPage() {
  const navigate = useNavigate();
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<EntryReason>('RECEPTION_FABRICATION');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/admin/stock');
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/stock')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entrée de stock</h1>
          <p className="text-sm text-gray-500 mt-0.5">Enregistrer une réception de marchandise</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Produit <span className="text-red-500">*</span></label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none"
            >
              <option value="">Sélectionner un produit</option>
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantité <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              placeholder="Ex: 5000"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Motif <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors text-center ${
                    reason === r.value
                      ? 'border-[#FF8C00] bg-orange-50 text-[#FF8C00]'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Référence document</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex: BL-2026-00345"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Informations complémentaires..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
          <button type="button" onClick={() => navigate('/admin/stock')} className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            Annuler
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF8C00] text-white text-sm font-medium rounded-lg hover:bg-[#E67E00] transition-colors"
          >
            <Save size={16} /> Enregistrer l'entrée
          </button>
        </div>
      </form>
    </div>
  );
}
