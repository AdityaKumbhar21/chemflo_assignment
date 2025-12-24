import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CubeIcon,
  TagIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Layout } from '../components/layout';
import { Spinner, Badge } from '../components/common';
import { inventoryService } from '../services';

const StatCard = ({ title, value, icon: Icon, color, trend, link }) => {
  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  };

  return (
    <Link
      to={link}
      className="card hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className="flex items-center gap-1 text-sm mt-2 text-gray-500">
              {trend.direction === 'up' ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
              )}
              {trend.value}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Link>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await inventoryService.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard" subtitle="Overview of your inventory">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" subtitle="Overview of your inventory">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={CubeIcon}
          color="primary"
          link="/products"
        />
        <StatCard
          title="Categories"
          value={stats?.totalCategories || 0}
          icon={TagIcon}
          color="success"
          link="/categories"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockCount || 0}
          icon={ExclamationTriangleIcon}
          color={stats?.lowStockCount > 0 ? 'danger' : 'warning'}
          link="/inventory?lowStock=true"
        />
        <StatCard
          title="Total Stock Units"
          value={stats?.totalStockValue?.toFixed(2) || 0}
          icon={ArrowTrendingUpIcon}
          color="primary"
          link="/inventory"
        />
      </div>

      {/* Recent Movements */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Stock Movements</h2>
          <Link
            to="/movements"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all →
          </Link>
        </div>

        {stats?.recentMovements?.length > 0 ? (
          <div className="space-y-4">
            {stats.recentMovements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      movement.type === 'IN'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {movement.type === 'IN' ? (
                      <ArrowTrendingUpIcon className="w-5 h-5" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{movement.product?.name}</p>
                    <p className="text-sm text-gray-500">
                      {movement.quantity} {movement.product?.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={movement.type === 'IN' ? 'success' : 'danger'}>
                    {movement.type}
                  </Badge>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {new Date(movement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent movements
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
