import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/apiClient';
import { Category } from '../../types/category';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToastStore } from '../../store/useToastStore';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { showToast } = useToastStore();

  const [formData, setFormData] = useState({
    name: '',
    slug: 'home' as any,
    tagline: '',
    description: '',
    image: '',
    heroImage: '',
    itemCount: 4,
  });

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setFormData({
      name: c.name,
      slug: c.slug,
      tagline: c.tagline,
      description: c.description,
      image: c.image,
      heroImage: c.heroImage,
      itemCount: c.itemCount,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        showToast({ title: 'Updated', message: `${formData.name} updated.`, type: 'success' });
        setEditingCategory(null);
      } else {
        await categoryService.createCategory({
          ...formData,
          featured: true,
        });
        showToast({ title: 'Created', message: `${formData.name} created.`, type: 'success' });
        setIsAddOpen(false);
      }
      loadCategories();
    } catch {
      showToast({ title: 'Error', message: 'Could not save category.', type: 'error' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete collection "${name}"?`)) {
      try {
        await categoryService.deleteCategory(id);
        showToast({ title: 'Deleted', message: `${name} removed.`, type: 'info' });
        loadCategories();
      } catch {
        showToast({ title: 'Error', message: 'Could not delete.', type: 'error' });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
            Taxonomy & Merchandising
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
            Curated Collections ({categories.length})
          </h1>
        </div>

        <Button
          variant="dark"
          size="sm"
          onClick={() => {
            setFormData({
              name: '',
              slug: 'home',
              tagline: '',
              description: '',
              image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=80',
              heroImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85',
              itemCount: 0,
            });
            setIsAddOpen(true);
          }}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Collection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-6 bg-[#FAF8F5] border border-sand-300 shadow-sm flex flex-col sm:flex-row gap-6 justify-between"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full sm:w-32 aspect-[4/5] object-cover bg-sand-200 border border-sand-300"
            />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-2xl text-charcoal-900 font-normal">{cat.name}</h3>
                  <span className="text-xs font-mono uppercase bg-sand-200 px-2 py-0.5 text-charcoal-700">
                    /{cat.slug}
                  </span>
                </div>
                <p className="text-xs uppercase tracking-wider font-semibold text-moss-800 mt-1">
                  {cat.tagline}
                </p>
                <p className="text-xs text-charcoal-600 font-light mt-2 line-clamp-2">
                  {cat.description}
                </p>
                <span className="text-xs text-charcoal-500 mt-2 block">
                  {cat.itemCount} linked products
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-sand-200 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 text-charcoal-600 hover:text-moss-900"
                  title="Edit collection"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 text-charcoal-400 hover:text-red-700"
                  title="Delete collection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isAddOpen || !!editingCategory}
        onClose={() => {
          setIsAddOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? `Edit "${editingCategory.name}"` : 'Add Collection'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Collection Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Slug Identifier *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value as any })}
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs font-mono text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Thumbnail Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setIsAddOpen(false);
                setEditingCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="dark" size="md">
              Save Collection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
