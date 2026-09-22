import React, { useState, useEffect } from 'react';
import { discountService } from '../../services/apiClient';
import { Discount } from '../../types/discount';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToastStore } from '../../store/useToastStore';
import { Plus, Tag, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AdminDiscounts: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { showToast } = useToastStore();

  const [formData, setFormData] = useState({
    code: '',
    percentage: 15,
    minSpend: 0,
    expiresAt: '2026-12-31T23:59:59Z',
    description: '',
    isActive: true,
  });

  const loadDiscounts = async () => {
    setIsLoading(true);
    try {
      const data = await discountService.getDiscounts();
      setDiscounts(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) return;

    try {
      await discountService.createDiscount({
        code: formData.code.toUpperCase().trim(),
        percentage: Number(formData.percentage),
        minSpend: formData.minSpend ? Number(formData.minSpend) : undefined,
        expiresAt: formData.expiresAt,
        description: formData.description,
        isActive: formData.isActive,
      });

      showToast({
        title: 'Discount Created',
        message: `Promo code ${formData.code.toUpperCase()} is now live.`,
        type: 'success',
      });
      setIsAddOpen(false);
      loadDiscounts();
    } catch {
      showToast({ title: 'Error', message: 'Could not create discount.', type: 'error' });
    }
  };

  const handleToggle = async (d: Discount) => {
    try {
      await discountService.updateDiscount(d.id, { isActive: !d.isActive });
      showToast({
        title: 'Updated',
        message: `${d.code} is now ${!d.isActive ? 'Active' : 'Disabled'}.`,
        type: 'info',
      });
      loadDiscounts();
    } catch {
      showToast({ title: 'Error', message: 'Could not update status.', type: 'error' });
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (window.confirm(`Delete discount code ${code}?`)) {
      try {
        await discountService.deleteDiscount(id);
        showToast({ title: 'Deleted', message: `${code} removed.`, type: 'info' });
        loadDiscounts();
      } catch {
        showToast({ title: 'Error', message: 'Could not delete discount.', type: 'error' });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
            Promotions & Campaigns
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
            Discount Codes ({discounts.length})
          </h1>
        </div>

        <Button
          variant="dark"
          size="sm"
          onClick={() => {
            setFormData({
              code: '',
              percentage: 15,
              minSpend: 50,
              expiresAt: '2026-12-31T23:59:59Z',
              description: '15% seasonal promotion',
              isActive: true,
            });
            setIsAddOpen(true);
          }}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Create Promo Code
        </Button>
      </div>

      {/* Discounts Table */}
      <div className="bg-[#FAF8F5] border border-sand-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-200/60 border-b border-sand-300 uppercase tracking-wider text-charcoal-800 font-semibold">
              <tr>
                <th className="p-3.5">Promo Code</th>
                <th className="p-3.5">Discount Rate</th>
                <th className="p-3.5">Min Spend</th>
                <th className="p-3.5">Expires</th>
                <th className="p-3.5">Redemptions</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-charcoal-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-charcoal-500">
                    Loading promotions...
                  </td>
                </tr>
              ) : (
                discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-sand-100/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-charcoal-900 flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-moss-800" />
                      <span>{d.code}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-moss-900">
                      {d.percentage === 100 ? 'Free Shipping' : `${d.percentage}% Off`}
                    </td>
                    <td className="p-3.5">{d.minSpend ? `$${d.minSpend}` : 'No minimum'}</td>
                    <td className="p-3.5">{formatDate(d.expiresAt)}</td>
                    <td className="p-3.5">{d.usageCount} times used</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggle(d)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold border ${
                          d.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-stone-200 text-stone-600 border-stone-300'
                        }`}
                      >
                        {d.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{d.isActive ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDelete(d.id, d.code)}
                        className="p-1.5 text-charcoal-400 hover:text-red-700"
                        title="Delete promo code"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PROMO MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Promo Code"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Code (e.g. AUTUMN15) *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="AUTUMN15"
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs font-mono uppercase text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Discount (%) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={100}
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: Number(e.target.value) })}
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Min Order Spend ($)
              </label>
              <input
                type="number"
                min={0}
                value={formData.minSpend}
                onChange={(e) => setFormData({ ...formData, minSpend: Number(e.target.value) })}
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Campaign Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="15% off seasonal curations"
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" size="md" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="dark" size="md">
              Create Discount
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
