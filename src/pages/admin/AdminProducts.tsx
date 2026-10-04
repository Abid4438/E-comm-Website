import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/apiClient';
import { Product, CategoryType, ProductBadge } from '../../types/product';
import { formatPrice } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToastStore } from '../../store/useToastStore';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchParams] = useSearchParams();
  const { showToast } = useToastStore();

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    tagline: '',
    shortDescription: '',
    description: '',
    detailsInput: '',
    materialsInput: '',
    dimensions: '',
    shippingInfo: '',
    returnsInfo: '',
    price: 95,
    compareAtPrice: 0,
    category: 'home' as CategoryType,
    stock: 25,
    badge: '' as ProductBadge | '',
    imageUrl: '',
    colorsInput: 'Sand, Moss, Charcoal',
    sizesInput: 'Standard',
  });

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    if (searchParams.get('action') === 'new') {
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      slug: '',
      sku: `MOS-${Math.floor(1000 + Math.random() * 9000)}`,
      tagline: '',
      shortDescription: '',
      description: '',
      detailsInput: '',
      materialsInput: '',
      dimensions: '',
      shippingInfo: '',
      returnsInfo: '',
      price: 0,
      compareAtPrice: 0,
      category: 'home',
      stock: 0,
      badge: '',
      imageUrl: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=1200&q=80',
      colorsInput: '',
      sizesInput: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      tagline: p.tagline || '',
      shortDescription: p.shortDescription,
      description: p.description,
      detailsInput: (p.details || []).join('\n'),
      materialsInput: (p.materials || []).join('\n'),
      dimensions: p.dimensions || '',
      shippingInfo: p.shippingInfo || '',
      returnsInfo: p.returnsInfo || '',
      price: p.price,
      compareAtPrice: p.compareAtPrice || 0,
      category: p.category,
      stock: p.stock,
      badge: p.badge || '',
      imageUrl: p.images[0] || '',
      colorsInput: p.colors.map((c) => c.name).join(', '),
      sizesInput: p.sizes.map((s) => s.name).join(', '),
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      showToast({ title: 'Validation Error', message: 'Name and SKU are required.', type: 'error' });
      return;
    }

    const slug =
      formData.slug ||
      formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const parsedColors = formData.colorsInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((name) => ({
        name,
        hex: name.toLowerCase().includes('moss') ? '#3B4D3C' : name.toLowerCase().includes('black') ? '#1C1C1E' : '#D2C8BC',
        inStock: true,
      }));

    const parsedSizes = formData.sizesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, inStock: true }));

    try {
      if (editingProduct) {
        // Update existing product
        await productService.updateProduct(editingProduct.id, {
          name: formData.name,
          slug,
          sku: formData.sku,
          tagline: formData.tagline,
          shortDescription: formData.shortDescription,
          description: formData.description,
          details: formData.detailsInput
            ? formData.detailsInput.split('\n').map((line) => line.trim()).filter(Boolean)
            : editingProduct.details,
          materials: formData.materialsInput
            ? formData.materialsInput.split('\n').map((line) => line.trim()).filter(Boolean)
            : editingProduct.materials,
dimensions: formData.dimensions || '',
          shippingInfo: formData.shippingInfo || '',
          returnsInfo: formData.returnsInfo || '',
          price: Number(formData.price),
          compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
          category: formData.category,
          stock: Number(formData.stock),
          badge: (formData.badge as ProductBadge) || undefined,
          images: [formData.imageUrl || editingProduct.images[0]],
          colors: parsedColors.length ? parsedColors : editingProduct.colors,
          sizes: parsedSizes.length ? parsedSizes : editingProduct.sizes,
        });

        showToast({ title: 'Product Updated', message: `${formData.name} updated successfully.`, type: 'success' });
        setEditingProduct(null);
      } else {
        // Create new product
        await productService.createProduct({
          name: formData.name,
          slug,
          sku: formData.sku,
          tagline: formData.tagline,
          shortDescription: formData.shortDescription,
          description: formData.description,
          details: formData.detailsInput
            ? formData.detailsInput.split('\n').map((line) => line.trim()).filter(Boolean)
            : [],
          materials: formData.materialsInput
            ? formData.materialsInput.split('\n').map((line) => line.trim()).filter(Boolean)
            : [],
dimensions: formData.dimensions || '',
          shippingInfo: formData.shippingInfo || '',
          returnsInfo: formData.returnsInfo || '',
          price: Number(formData.price),
          compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
          category: formData.category,
          stock: Number(formData.stock),
          badge: (formData.badge as ProductBadge) || undefined,
          images: [formData.imageUrl || 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=1200&q=80'],
          colors: parsedColors.length ? parsedColors : [{ name: 'Standard', hex: '#D2C8BC', inStock: true }],
          sizes: parsedSizes.length ? parsedSizes : [{ name: 'One Size', inStock: true }],
          rating: 5.0,
          reviewCount: 0,
          status: 'active',
        });

        showToast({ title: 'Product Created', message: `${formData.name} added to catalog.`, type: 'success' });
        setIsAddModalOpen(false);
      }
      loadProducts();
    } catch {
      showToast({ title: 'Error', message: 'Could not save product.', type: 'error' });
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await productService.deleteProduct(id);
        showToast({ title: 'Deleted', message: `${name} has been removed.`, type: 'info' });
        loadProducts();
      } catch {
        showToast({ title: 'Error', message: 'Could not delete product.', type: 'error' });
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
            Catalog Administration
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
            Products ({products.length})
          </h1>
        </div>

        <Button
          variant="dark"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add New Product
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#FAF8F5] border border-sand-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full bg-white border border-sand-300 pl-9 pr-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs uppercase tracking-wider text-charcoal-500 font-medium">
            Category:
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-sand-300 px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="home">Home & Living</option>
            <option value="apparel">Apparel</option>
            <option value="accessories">Accessories</option>
            <option value="essentials">Everyday Essentials</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#FAF8F5] border border-sand-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-200/60 border-b border-sand-300 uppercase tracking-wider text-charcoal-800 font-semibold">
              <tr>
                <th className="p-3.5">Image</th>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Badge</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-charcoal-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-charcoal-500">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-charcoal-500">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-sand-100/50 transition-colors">
                    <td className="p-3.5">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-10 h-12 object-cover bg-sand-200 border border-sand-300"
                      />
                    </td>
                    <td className="p-3.5">
                      <span className="font-serif text-sm font-semibold text-charcoal-900 block truncate max-w-xs">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-charcoal-400">/{p.slug}</span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-charcoal-600">{p.sku}</td>
                    <td className="p-3.5 capitalize">{p.category}</td>
                    <td className="p-3.5 font-medium text-charcoal-900">
                      {formatPrice(p.price)}
                      {p.compareAtPrice && (
                        <span className="block text-[10px] text-charcoal-400 line-through">
                          {formatPrice(p.compareAtPrice)}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={p.stock === 0 ? 'out-of-stock' : p.stock <= 5 ? 'low-stock' : 'in-stock'}
                      >
                        {p.stock} units
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      {p.badge ? <Badge variant={p.badge} /> : <span className="text-charcoal-300">—</span>}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <a
                        href={`/product/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-charcoal-400 hover:text-charcoal-900 inline-block"
                        title="Preview on storefront"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-charcoal-600 hover:text-moss-900 inline-block"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1.5 text-charcoal-400 hover:text-red-700 inline-block"
                        title="Delete product"
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

      {/* ADD / EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isAddModalOpen || !!editingProduct}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? `Edit "${editingProduct.name}"` : 'Add New Essential Object'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Hasami Ceramic Bowl"
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                SKU Code *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs font-mono text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              >
                <option value="home">Home</option>
                <option value="apparel">Apparel</option>
                <option value="accessories">Accessories</option>
                <option value="essentials">Everyday Essentials</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Compare Price ($)
              </label>
              <input
                type="number"
                value={formData.compareAtPrice || ''}
                onChange={(e) => setFormData({ ...formData, compareAtPrice: Number(e.target.value) })}
                placeholder="Sale discount"
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Stock Inventory
              </label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Badge
              </label>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value as any })}
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              >
                <option value="">None</option>
                <option value="NEW">NEW</option>
                <option value="BESTSELLER">BESTSELLER</option>
                <option value="LIMITED">LIMITED</option>
                <option value="SALE">SALE</option>
                <option value="ORGANIC">ORGANIC</option>
                <option value="HANDCRAFTED">HANDCRAFTED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Product Details (one per line)
            </label>
            <textarea
              rows={4}
              value={formData.detailsInput}
              onChange={(e) => setFormData({ ...formData, detailsInput: e.target.value })}
              placeholder="Handcrafted in small studio batches&#10;Premium natural materials&#10;Lifetime quality warranty"
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Materials (one per line)
            </label>
            <textarea
              rows={3}
              value={formData.materialsInput}
              onChange={(e) => setFormData({ ...formData, materialsInput: e.target.value })}
              placeholder="Natural raw sustainable fibers and stone&#10;Eco-friendly dyes"
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Dimensions
              </label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g. 30 x 20 x 15 cm"
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Shipping Info
              </label>
              <input
                type="text"
                value={formData.shippingInfo}
                onChange={(e) => setFormData({ ...formData, shippingInfo: e.target.value })}
                placeholder="Free standard shipping on orders over $100..."
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Returns Info
            </label>
            <input
              type="text"
              value={formData.returnsInfo}
              onChange={(e) => setFormData({ ...formData, returnsInfo: e.target.value })}
              placeholder="Complimentary 30-day returns..."
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Primary Image URL
            </label>
            <input
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Short Editorial Summary
            </label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="1-2 sentences summarizing handcraft and materials"
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Full Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed craftsmanship and sensory description..."
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Colors (comma-separated)
              </label>
              <input
                type="text"
                value={formData.colorsInput}
                onChange={(e) => setFormData({ ...formData, colorsInput: e.target.value })}
                placeholder="Raw Sand, Charcoal"
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Sizes (comma-separated)
              </label>
              <input
                type="text"
                value={formData.sizesInput}
                onChange={(e) => setFormData({ ...formData, sizesInput: e.target.value })}
                placeholder="S, M, L, XL or Standard"
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="dark" size="md">
              {editingProduct ? 'Save Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
