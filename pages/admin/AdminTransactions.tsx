import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../stores/useStore';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminTransactions() {
  const { t } = useTranslation();
  const { transactions, users, updateTransaction, updateUser } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'deposit' | 'withdrawal'>('all');

  const filtered = transactions
    .filter((tx) => activeTab === 'all' || tx.type === activeTab)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleApprove = (tx: typeof transactions[0]) => {
    const user = users.find((u) => u.id === tx.userId);
    if (!user) return;

    updateTransaction(tx.id, { status: 'approved', processedAt: new Date().toISOString() });

    if (tx.type === 'deposit') {
      updateUser(tx.userId, {
        balance: (user.balance || 0) + tx.amount,
        totalInvested: (user.totalInvested || 0) + tx.amount,
      });
    }

    toast.success('Transaction approved!');
  };

  const handleReject = (txId: string) => {
    updateTransaction(txId, { status: 'rejected', processedAt: new Date().toISOString(), adminNote: 'Rejected by admin' });
    toast.success('Transaction rejected!');
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-900">{t('admin.transactions')}</h1>
        <p className="text-surface-500 mt-1">Manage deposits and withdrawals</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-2">
        {(['all', 'deposit', 'withdrawal'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-surface-600 border border-surface-200 hover:border-primary-200'
            }`}
          >
            {tab === 'all' ? 'All' : tab === 'deposit' ? t('admin.deposits') : t('admin.withdrawals')}
            {tab !== 'all' && (
              <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                {transactions.filter((tx) => tx.type === tab && tx.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Transactions Table */}
      <motion.div variants={item} className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-surface-400 bg-surface-50 border-b border-surface-100">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium hidden sm:table-cell">Network</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const user = users.find((u) => u.id === tx.userId);
                return (
                  <motion.tr key={tx.id} variants={item} className="border-b border-surface-50 last:border-0 hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-surface-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-surface-400">{user?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {tx.type === 'deposit' ? (
                          <ArrowDownRight className="w-4 h-4 text-accent-500" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-500" />
                        )}
                        <span className="capitalize font-medium">{tx.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(tx.amount)}</td>
                    <td className="px-6 py-4 hidden sm:table-cell text-surface-500">{tx.cryptoNetwork}</td>
                    <td className="px-6 py-4 text-surface-500">{formatDate(tx.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={
                        tx.status === 'approved' ? 'badge-success' :
                        tx.status === 'pending' ? 'badge-warning' : 'badge-danger'
                      }>
                        {tx.status}
                      </span>
                      {tx.adminNote && <p className="text-xs text-surface-400 mt-1">{tx.adminNote}</p>}
                    </td>
                    <td className="px-6 py-4">
                      {tx.status === 'pending' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleApprove(tx)}
                            className="p-1.5 text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(tx.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
