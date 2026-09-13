import { useTranslation } from 'react-i18next';
import { useStore } from '../stores/useStore';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, formatDate } from '../utils/helpers';
import { generatePortfolioChartData, generateProfitChartData } from '../mock/data';

const portfolioData = generatePortfolioChartData();
const profitData = generateProfitChartData();

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function Dashboard() {
  const { t } = useTranslation();
  const { currentUser, investments, transactions, plans } = useStore();

  const userInvestments = investments.filter((i) => i.userId === currentUser?.id && i.status === 'active');
  const userTransactions = transactions
    .filter((t) => t.userId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const pieData = userInvestments.map((inv) => {
    const plan = plans.find((p) => p.id === inv.planId);
    return { name: plan?.name || 'Unknown', value: inv.amount };
  });

  const stats = [
    {
      label: t('dashboard.balance'),
      value: formatCurrency(currentUser?.balance || 0),
      icon: Wallet,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: t('dashboard.invested'),
      value: formatCurrency(currentUser?.totalInvested || 0),
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      label: t('dashboard.currentProfit'),
      value: formatCurrency(currentUser?.currentProfit || 0),
      icon: DollarSign,
      color: 'from-accent-500 to-accent-600',
      bg: 'bg-accent-50',
      iconColor: 'text-accent-600',
    },
    {
      label: t('dashboard.totalEarned'),
      value: formatCurrency(currentUser?.totalEarned || 0),
      icon: BarChart3,
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome */}
      <motion.div variants={item}>
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-900">
          {t('dashboard.welcome')}, {currentUser?.firstName}!
        </h1>
        <p className="text-surface-500 mt-1">{t('dashboard.portfolioOverview')}</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card group hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-xs text-surface-400 font-medium uppercase tracking-wide">{stat.label}</p>
            <p className="text-xl lg:text-2xl font-bold text-surface-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Chart */}
        <motion.div variants={item} className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-surface-900 mb-4">{t('dashboard.portfolioOverview')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="url(#colorBalance)" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#colorProfit)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div variants={item} className="card">
          <h3 className="text-lg font-semibold text-surface-900 mb-4">{t('dashboard.activeInvestments')}</h3>
          {pieData.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {pieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-surface-600">{entry.name}</span>
                    </div>
                    <span className="font-medium text-surface-900">{formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-surface-400 text-sm">
              {t('dashboard.noInvestments')}
            </div>
          )}
        </motion.div>
      </div>

      {/* Profit Trend & Active Investments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Trend */}
        <motion.div variants={item} className="card">
          <h3 className="text-lg font-semibold text-surface-900 mb-4">{t('dashboard.profitTrend')}</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitData}>
                <defs>
                  <linearGradient id="colorProfitTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#10b981"
                  fill="url(#colorProfitTrend)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Active Investments */}
        <motion.div variants={item} className="card">
          <h3 className="text-lg font-semibold text-surface-900 mb-4">{t('dashboard.activeInvestments')}</h3>
          <div className="space-y-3">
            {userInvestments.length > 0 ? (
              userInvestments.map((inv) => {
                const plan = plans.find((p) => p.id === inv.planId);
                const progress = ((new Date().getTime() - new Date(inv.startDate).getTime()) /
                  (new Date(inv.endDate).getTime() - new Date(inv.startDate).getTime())) * 100;
                return (
                  <div key={inv.id} className="p-4 bg-surface-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-surface-900">{plan?.name || 'Plan'}</span>
                      <span className="text-sm font-medium text-accent-600">{formatCurrency(inv.currentProfit)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-surface-400 mb-2">
                      <span>{formatCurrency(inv.amount)} invested</span>
                      <span>{inv.dailyPercentage}% daily</span>
                    </div>
                    <div className="w-full bg-surface-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-surface-400 text-sm">{t('dashboard.noInvestments')}</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div variants={item} className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-surface-900">{t('dashboard.recentTransactions')}</h3>
          <a href="/transactions" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            {t('dashboard.viewAll')}
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-surface-400 border-b border-surface-100">
                <th className="pb-3 font-medium">{t('transactions.type')}</th>
                <th className="pb-3 font-medium">{t('transactions.amount')}</th>
                <th className="pb-3 font-medium">{t('transactions.date')}</th>
                <th className="pb-3 font-medium">{t('transactions.status')}</th>
              </tr>
            </thead>
            <tbody>
              {userTransactions.length > 0 ? (
                userTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-surface-50 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {tx.type === 'deposit' ? (
                          <ArrowDownRight className="w-4 h-4 text-accent-500" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-medium capitalize">{tx.type}</span>
                      </div>
                    </td>
                    <td className="py-3 font-medium">{formatCurrency(tx.amount)}</td>
                    <td className="py-3 text-surface-500">{formatDate(tx.createdAt)}</td>
                    <td className="py-3">
                      <span
                        className={
                          tx.status === 'approved'
                            ? 'badge-success'
                            : tx.status === 'pending'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }
                      >
                        {t(`transactions.${tx.status}`)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-surface-400">
                    {t('transactions.noTransactions')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
