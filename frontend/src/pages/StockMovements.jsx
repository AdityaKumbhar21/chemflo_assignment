import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowsRightLeftIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Layout } from '../components/layout';
import {
  Spinner,
  EmptyState,
  Badge,
  Pagination,
} from '../components/common';
import { inventoryService, productService } from '../services';

const StockMovements = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    productId: searchParams.get('productId') || '',
    type: searchParams.get('type') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchMovements();
    // Update URL params
    const params = new URLSearchParams();
    if (filters.productId) params.set('productId', filters.productId);
    if (filters.type) params.set('type', filters.type);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.page > 1) params.set('page', filters.page.toString());
    setSearchParams(params);
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll({ limit: 100 });
      setProducts(response.data.data?.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getMovements({
        productId: filters.productId,
        type: filters.type,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: filters.page,
        limit: 20,
      });
      setMovements(response.data.data?.movements || []);
      setPagination(response.data.data?.pagination || { page: 1, totalPages: 1 });
    } catch (error) {
      toast.error('Failed to fetch stock movements');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      productId: '',
      type: '',
      startDate: '',
      endDate: '',
      page: 1,
    });
  };

  const hasFilters = filters.productId || filters.type || filters.startDate || filters.endDate;

  return (
    <Layout title="Stock Movements" subtitle="Track all inventory changes">
      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              className="select w-48"
              value={filters.productId}
              onChange={(e) => setFilters({ ...filters, productId: e.target.value, page: 1 })}
            >
              <option value="">All Products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="select w-32"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            >
              <option value="">All Types</option>
              <option value="IN">Stock IN</option>
              <option value="OUT">Stock OUT</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              className="input w-40"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              placeholder="Start date"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              className="input w-40"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              placeholder="End date"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Movements Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : movements.length > 0 ? (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movements.map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(movement.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(movement.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          movement.type === 'IN'
                            ? 'bg-emerald-100'
                            : 'bg-red-100'
                        }`}
                      >
                        {movement.type === 'IN' ? (
                          <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {movement.product?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          CAS: {movement.product?.casNumber}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={movement.type === 'IN' ? 'success' : 'danger'}>
                      {movement.type === 'IN' ? 'Stock IN' : 'Stock OUT'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-semibold ${
                        movement.type === 'IN' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {movement.type === 'IN' ? '+' : '-'}
                      {movement.quantity} {movement.product?.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500 max-w-xs truncate">
                      {movement.notes || '—'}
                    </p>
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
            icon={ArrowsRightLeftIcon}
            title="No movements found"
            description={
              hasFilters
                ? 'Try adjusting your filter criteria.'
                : 'Stock movements will appear here when you update inventory.'
            }
          />
        </div>
      )}
    </Layout>
  );
};

export default StockMovements;
