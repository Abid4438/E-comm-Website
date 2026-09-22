import React, { useState, useEffect } from 'react';
import { productService } from '../../services/apiClient';
import { Product } from '../../types/product';
import { Badge } from '../../components/ui/Badge';
import { useToastStore } from '../../store/useToastStore';
import { Search, Save, AlertTriangle } from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockChanges, setStockChanges] = useState<{ [id: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToastStore();

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
      const initialStock: { [id: string]: number } = {};
      data.forEach((p) => {
        initialStock[p.id] = p.stock;
      });
      setStockChanges(initialStock);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockChange = (id: string, value: number) => {
    setStockChanges((prev) => ({
      ...prev,
      [id]: Math.max(0, value),
    }));
  };

  const handleSaveStock = async (p: Product) => {
    const newStock = stockChanges[p.id];
    try {
      await productService.updateProduct(p.id, { stock: newStock });
      showToast({
        title: 'Stock Updated',
        message: `${p.name} inventory set to ${newStock} units.`,
        type: 'success',
      });
      loadInventory();
    } catch {
      showToast({ title: 'Error', message: 'Could not update inventory.', type: 'error' });
    }
  };

  const lowStockCount = products.filter((p) => p.stock <= 5 && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Low Stock Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
            Warehouse & Stock Control
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
            Inventory Management
          </h1>
        </div>

        {(lowStockCount > 0 || outOfStockCount > 0) && (
          <div className="p-3 bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Inventory Warning:</strong> {lowStockCount} items low in stock, {outOfStockCount} items sold out.
            </span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="p-4 bg-[#FAF8F5] border border-sand-300 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU or object name..."
            className="w-full bg-white border border-sand-300 pl-9 pr-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#FAF8F5] border border-sand-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-200/60 border-b border-sand-300 uppercase tracking-wider text-charcoal-800 font-semibold">
              <tr>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Update Inventory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-charcoal-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-charcoal-500">
                    Loading inventory records...
                  </td>
                </tr>
              ) : filteredProducts.map((p) => {
                const currentVal = stockChanges[p.id] !== undefined ? stockChanges[p.id] : p.stock;
                const hasChanged = currentVal !== p.stock;

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-sand-100/50 transition-colors ${
                      p.stock === 0 ? 'bg-red-50/40' : p.stock <= 5 ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="p-3.5 font-mono text-[11px] font-semibold text-charcoal-900">
                      {p.sku}
                    </td>
                    <td className="p-3.5 font-medium text-charcoal-900">{p.name}</td>
                    <td className="p-3.5 capitalize">{p.category}</td>
                    <td className="p-3.5 font-serif text-base font-semibold text-charcoal-900">
                      {p.stock} units
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={p.stock === 0 ? 'out-of-stock' : p.stock <= 5 ? 'low-stock' : 'in-stock'}
                      >
                        {p.stock === 0 ? 'Sold Out' : p.stock <= 5 ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={currentVal}
                          onChange={(e) => handleStockChange(p.id, Number(e.target.value))}
                          className="w-20 bg-white border border-sand-300 p-1.5 text-center text-xs font-mono font-medium focus:outline-none focus:border-moss-900"
                        />
                        <button
                          onClick={() => handleSaveStock(p)}
                          disabled={!hasChanged}
                          className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1 transition-all ${
                            hasChanged
                              ? 'bg-moss-900 text-sand-50 hover:bg-black shadow-sm'
                              : 'bg-sand-200 text-charcoal-400 cursor-not-allowed'
                          }`}
                        >
                          <Save className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
