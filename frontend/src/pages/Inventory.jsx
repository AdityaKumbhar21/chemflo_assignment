import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Layout } from '../components/layout';
import {
  Button,
  Modal,
  Spinner,
  EmptyState,
  Badge,
  Pagination,
} from '../components/common';
import { inventoryService, categoryService } from '../services';

const StockUpdateForm = ({ inventory, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    type: 'IN',
    quantity: '',
    notes: '',
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const quantity = parseFloat(formData.quantity);

    if (!quantity || quantity <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    if (
      formData.type === 'OUT' &&
      quantity > inventory.currentStock
    ) {
      setError(
        `Insufficient stock. Available: ${inventory.currentStock} ${inventory.product.unit}`
      );
      return;
    }

    onSubmit({
      type: formData.type,
      quantity,
      notes: formData.notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <p className="text-sm text-gray-500 mb-1">Current Stock</p>
        <p className="text-2xl font-bold text-gray-900">
          {inventory.currentStock} <span className="text-base font-normal text-gray-500">{inventory.product.unit}</span>
        </p>
      </div>

      <div>
        <label className="label">Movement Type *</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'IN' })}
            className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
              formData.type === 'IN'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <ArrowUpIcon className="w-5 h-5" />
            <span className="font-medium">Stock IN</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'OUT' })}
            className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
              formData.type === 'OUT'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <ArrowDownIcon className="w-5 h-5" />
            <span className="font-medium">Stock OUT</span>
          </button>
        </div>
      </div>

      <div>
        <label className="label">Quantity ({inventory.product.unit}) *</label>
        <input
          type="number"
          className={`input ${error ? 'input-error' : ''}`}
          value={formData.quantity}
          onChange={(e) => {
            setFormData({ ...formData, quantity: e.target.value });
            setError('');
          }}
          placeholder="Enter quantity"
          min="0.01"
          step="0.01"
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>

      <div>
        <label className="label">Notes (Optional)</label>
        <textarea
          className="input min-h-[80px] resize-none"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add notes about this stock movement..."
        />
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant={formData.type === 'IN' ? 'success' : 'danger'}
          loading={loading}
        >
          {formData.type === 'IN' ? 'Add Stock' : 'Remove Stock'}
        </Button>
      </div>
    </form>
  );
};

const Inventory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inventories, setInventories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [filters, setFilters] = useState({
    categoryId: searchParams.get('categoryId') || '',
    lowStockOnly: searchParams.get('lowStock') === 'true',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchInventory();
    // Update URL params
    const params = new URLSearchParams();
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.lowStockOnly) params.set('lowStock', 'true');
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

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getAll({
        categoryId: filters.categoryId,
        lowStockOnly: filters.lowStockOnly,
        page: filters.page,
        limit: 10,
      });
      setInventories(response.data.data?.inventories || []);
      setPagination(response.data.data?.pagination || { page: 1, totalPages: 1 });
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (data) => {
    setSubmitting(true);
    try {
      await inventoryService.updateStock(selectedInventory.productId, data);
      toast.success(
        data.type === 'IN'
          ? `Added ${data.quantity} ${selectedInventory.product.unit} to stock`
          : `Removed ${data.quantity} ${selectedInventory.product.unit} from stock`
      );
      setSelectedInventory(null);
      fetchInventory();
    } catch (error) {
      toast.error(error.message || 'Failed to update stock');
    } finally {
      setSubmitting(false);
    }
  };

  const isLowStock = (inventory) => {
    return inventory.currentStock <= inventory.product.lowStockThreshold;
  };

  const getStockStatus = (inventory) => {
    const percentage = (inventory.currentStock / inventory.product.lowStockThreshold) * 100;
    if (percentage <= 50) return { variant: 'danger', label: 'Critical' };
    if (percentage <= 100) return { variant: 'warning', label: 'Low' };
    return { variant: 'success', label: 'In Stock' };
  };

  return (
    <Layout title="Inventory" subtitle="Track and manage stock levels">
      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-center">
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

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.lowStockOnly}
              onChange={(e) =>
                setFilters({ ...filters, lowStockOnly: e.target.checked, page: 1 })
              }
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">Show low stock only</span>
          </label>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : inventories.length > 0 ? (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventories.map((inventory) => {
                const status = getStockStatus(inventory);
                return (
                  <tr key={inventory.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isLowStock(inventory)
                              ? 'bg-red-100'
                              : 'bg-primary-100'
                          }`}
                        >
                          {isLowStock(inventory) ? (
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                          ) : (
                            <ClipboardDocumentListIcon className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {inventory.product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            CAS: {inventory.product.casNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {inventory.product.category ? (
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${inventory.product.category.color}20`,
                            color: inventory.product.category.color,
                          }}
                        >
                          {inventory.product.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg font-semibold ${
                            isLowStock(inventory) ? 'text-red-600' : 'text-gray-900'
                          }`}
                        >
                          {inventory.currentStock.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {inventory.product.unit}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {inventory.product.lowStockThreshold} {inventory.product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => setSelectedInventory({ ...inventory, defaultType: 'IN' })}
                        >
                          <ArrowUpIcon className="w-4 h-4 mr-1" />
                          IN
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setSelectedInventory({ ...inventory, defaultType: 'OUT' })}
                        >
                          <ArrowDownIcon className="w-4 h-4 mr-1" />
                          OUT
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
            icon={ClipboardDocumentListIcon}
            title="No inventory found"
            description={
              filters.categoryId || filters.lowStockOnly
                ? 'Try adjusting your filter criteria.'
                : 'Add products to start tracking inventory.'
            }
          />
        </div>
      )}

      {/* Stock Update Modal */}
      <Modal
        isOpen={!!selectedInventory}
        onClose={() => setSelectedInventory(null)}
        title={`Update Stock - ${selectedInventory?.product?.name}`}
      >
        {selectedInventory && (
          <StockUpdateForm
            inventory={selectedInventory}
            onSubmit={handleUpdateStock}
            onCancel={() => setSelectedInventory(null)}
            loading={submitting}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default Inventory;
