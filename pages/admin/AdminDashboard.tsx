import { useTranslation } from 'react-i18next';
import { useStore } from '../../stores/useStore';
import { motion } from 'framer-motion';
import { Users, TrendingUp, ArrowDownToLine, ArrowUpFromLine, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/helpers';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { users, investments, transactions, plans } = useStore();

  const regularUsers = users.filter((u) => u.role === 'user');
  const activeInvestments = investments.filter((i) => i.status === 'active');
  const pendingDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending');
  const totalRevenue = transactions
    .filter((t) => t.type === 'deposit' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    { label: t('admin.totalUsers'), value: regularUsers.length, icon: Users, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: t('admin.activeInvestments'), value: activeInvestments.length, icon: TrendingUp, bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: t('admin.pendingDeposits'), value: pendingDeposits.length, icon: ArrowDownToLine, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: t('admin.pendingWithdrawals'), value: pendingWithdrawals.length, icon: ArrowUpFromLine, bg: 'bg-red-50', color: 'text-red-600' },
    { label: t('admin.totalRevenue'), value: formatCurrency(totalRevenue), icon: DollarSign, bg: 'bg-accent-50', color: 'text-accent-600' },
  ];

  const revenueByPlan = plans.map((plan) => {
    const planInvestments = investments.filter((i) => i.planId === plan.id && i.status === 'active');
    return {
      name: plan.name,
      investments: planInvestments.length,
      revenue: planInvestments.reduce((sum, i) => sum + i.amount, 0),
    };
  });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-900">{t('admin.title')}</h1>
        <p className="text-surface-500 mt-1">{t('admin.overview')}</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card group hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xs text-surface-400 font-medium uppercase tracking-wide">{stat.label}</p>
            <p className="text-xl font-bold text-surface-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="card">
          <h3 className="text-lg font-semibold text-surface-900 mb-4">Revenue by Plan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByPlan}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="card">
          <h3 className="text-lg font-semibold text-surface-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {transactions
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 8)
              .map((tx) => {
                const user = users.find((u) => u.id === tx.userId);
                return (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-surface-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        tx.type === 'deposit' ? 'bg-accent-100 text-accent-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-surface-400 capitalize">{tx.type} - {tx.cryptoNetwork}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-surface-900">{formatCurrency(tx.amount)}</p>
                      <span className={
                        tx.status === 'approved' ? 'badge-success' :
                        tx.status === 'pending' ? 'badge-warning' : 'badge-danger'
                      }>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
