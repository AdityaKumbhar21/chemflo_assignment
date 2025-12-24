import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Layout } from '../components/layout';
import {
  Button,
  Modal,
  Spinner,
  ConfirmDialog,
  EmptyState,
  Badge,
  Pagination,
} from '../components/common';
import { productService, categoryService } from '../services';

const UNIT_OPTIONS = [
  { value: 'KG', label: 'Kilogram (KG)' },
  { value: 'MT', label: 'Metric Ton (MT)' },
  { value: 'LITRE', label: 'Litre' },
];

const ProductForm = ({ product, categories, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    casNumber: product?.casNumber || '',
    unit: product?.unit || 'KG',
    description: product?.description || '',
    categoryId: product?.categoryId || '',
    lowStockThreshold: product?.lowStockThreshold || 10,
    initialStock: 0,
  });

  const [errors, setErrors] = useState({});

  const validateCasNumber = (cas) => {
    const regex = /^\d{1,7}-\d{2}-\d$/;
    return regex.test(cas);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.casNumber.trim()) {
      newErrors.casNumber = 'CAS Number is required';
    } else if (!validateCasNumber(formData.casNumber)) {
      newErrors.casNumber = 'Invalid CAS Number format (e.g., 7732-18-5)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Product Name *</label>
          <input
            type="text"
            className={`input ${errors.name ? 'input-error' : ''}`}
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setErrors({ ...errors, name: '' });
            }}
            placeholder="Enter product name"
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="label">CAS Number *</label>
          <input
            type="text"
            className={`input ${errors.casNumber ? 'input-error' : ''}`}
            value={formData.casNumber}
            onChange={(e) => {
              setFormData({ ...formData, casNumber: e.target.value });
              setErrors({ ...errors, casNumber: '' });
            }}
            placeholder="e.g., 7732-18-5"
          />
          {errors.casNumber && (
            <p className="text-sm text-red-500 mt-1">{errors.casNumber}</p>
          )}
        </div>

        <div>
          <label className="label">Unit of Measurement *</label>
          <select
            className="select"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          >
            {UNIT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Category</label>
          <select
            className="select"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Low Stock Threshold</label>
          <input
            type="number"
            className="input"
            value={formData.lowStockThreshold}
            onChange={(e) =>
              setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })
            }
            min="0"
          />
        </div>

        {!product && (
          <div className="col-span-2">
            <label className="label">Initial Stock (Optional)</label>
            <input
              type="number"
              className="input"
              value={formData.initialStock}
              onChange={(e) =>
                setFormData({ ...formData, initialStock: parseFloat(e.target.value) || 0 })
              }
              min="0"
              step="0.01"
            />
          </div>
        )}

        <div className="col-span-2">
          <label className="label">Description (Optional)</label>
          <textarea
            className="input min-h-[80px] resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter product description"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [submitting, setSubmitting] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // Update URL params
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.page > 1) params.set('page', filters.page.toString());
    setSearchParams(params);
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 10 };
      if (filters.search) params.search = filters.search;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      const response = await productService.getAll(params);
      setProducts(response.data.data?.products || []);
      setPagination(response.data.data?.pagination || { page: 1, totalPages: 1 });
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await productService.create(data);
      toast.success('Product created successfully');
      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    setSubmitting(true);
    try {
      await productService.update(editingProduct.id, data);
      toast.success('Product updated successfully');
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await productService.delete(deleteDialog.product.id);
      toast.success('Product deleted successfully');
      setDeleteDialog({ open: false, product: null });
      fetchProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setSubmitting(false);
    }
  };

  const isLowStock = (product) => {
    return product.inventory?.currentStock <= product.lowStockThreshold;
  };

  return (
    <Layout title="Products" subtitle="Manage chemical products">
      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or CAS number..."
                className="input pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              className="select w-48"
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value, page: 1 })}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={() => setModalOpen(true)}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : products.length > 0 ? (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  CAS Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <CubeIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                      {product.casNumber}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    {product.category ? (
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${product.category.color}20`,
                          color: product.category.color,
                        }}
                      >
                        {product.category.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${
                          isLowStock(product) ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {product.inventory?.currentStock?.toFixed(2) || 0}
                      </span>
                      {isLowStock(product) && (
                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="gray">{product.unit}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteDialog({ open: true, product })}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={CubeIcon}
            title="No products found"
            description={
              filters.search || filters.categoryId
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first product to get started.'
            }
            action={
              !filters.search && !filters.categoryId ? (
                <Button onClick={() => setModalOpen(true)}>
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Product
                </Button>
              ) : null
            }
          />
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Product"
        size="lg"
      >
        <ProductForm
          categories={categories}
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
          loading={submitting}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Edit Product"
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSubmit={handleUpdate}
          onCancel={() => setEditingProduct(null)}
          loading={submitting}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteDialog.product?.name}"? This will also delete all inventory and stock movement records.`}
        confirmText="Delete"
        loading={submitting}
      />
    </Layout>
  );
};

export default Products;
