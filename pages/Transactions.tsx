import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../stores/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Copy,
  Check,
  X,
  Filter,
  Wallet,
  ArrowUpFromLine,
} from 'lucide-react';
import { formatCurrency, formatDate, generateId } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Transactions() {
  const { t } = useTranslation();
  const {
    currentUser,
    transactions,
    depositAddresses,
    addTransaction,
    updateProfile,
  } = useStore();
  const [activeFilter, setActiveFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const userTransactions = transactions
    .filter((tx) => tx.userId === currentUser?.id)
    .filter((tx) => activeFilter === 'all' || tx.type === activeFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const approvedTransactions = transactions.filter(
    (tx) => tx.userId === currentUser?.id && tx.status === 'approved'
  );
  const visibleDeposits = approvedTransactions.filter((tx) => tx.type === 'deposit');
  const visibleWithdrawals = approvedTransactions.filter((tx) => tx.type === 'withdrawal');

  const copyAddress = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    toast.success(t('deposit.copied'));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeposit = () => {
    if (!currentUser || !selectedAddress) return;
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;

    const addr = depositAddresses.find((a) => a.id === selectedAddress);
    if (!addr) return;

    const tx = {
      id: generateId(),
      userId: currentUser.id,
      type: 'deposit' as const,
      amount,
      cryptoName: addr.name.split(' ')[0],
      cryptoNetwork: addr.network,
      cryptoAddress: addr.address,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    addTransaction(tx);
    setShowDepositModal(false);
    setDepositAmount('');
    setSelectedAddress('');
    toast.success(t('deposit.depositSuccess'));
  };

  const handleWithdraw = () => {
    if (!currentUser) return;
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return;
    if (amount > (currentUser.balance || 0)) {
      toast.error(t('withdraw.insufficientBalance'));
      return;
    }

    const tx = {
      id: generateId(),
      userId: currentUser.id,
      type: 'withdrawal' as const,
      amount,
      cryptoName: currentUser.cryptoName || 'USDT',
      cryptoNetwork: currentUser.cryptoNetwork || 'Ethereum (ERC-20)',
      cryptoAddress: currentUser.cryptoAddress || '',
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    addTransaction(tx);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    toast.success(t('withdraw.success'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-surface-900">{t('transactions.title')}</h1>
          <p className="text-surface-500 mt-1">{t('transactions.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            onClick={() => setShowDepositModal(true)}
            className="btn-accent flex items-center gap-2 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Wallet className="w-4 h-4" />
            {t('nav.deposit')}
          </motion.button>
          <motion.button
            onClick={() => setShowWithdrawModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowUpFromLine className="w-4 h-4" />
            {t('nav.withdraw')}
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'deposit', 'withdrawal'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeFilter === filter
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-surface-600 border border-surface-200 hover:border-primary-200'
            }`}
          >
            {t(`transactions.${filter === 'all' ? 'all' : filter + 's'}`)}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-surface-400 bg-surface-50 border-b border-surface-100">
                <th className="px-6 py-3 font-medium">{t('transactions.type')}</th>
                <th className="px-6 py-3 font-medium">{t('transactions.amount')}</th>
                <th className="px-6 py-3 font-medium hidden sm:table-cell">{t('transactions.network')}</th>
                <th className="px-6 py-3 font-medium">{t('transactions.date')}</th>
                <th className="px-6 py-3 font-medium">{t('transactions.status')}</th>
              </tr>
            </thead>
            <tbody>
              {userTransactions.length > 0 ? (
                userTransactions.map((tx, i) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-surface-50 last:border-0 hover:bg-surface-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.type === 'deposit' ? 'bg-accent-100' : 'bg-red-100'
                        }`}>
                          {tx.type === 'deposit' ? (
                            <ArrowDownRight className="w-4 h-4 text-accent-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <span className="font-medium capitalize">{tx.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(tx.amount)}</td>
                    <td className="px-6 py-4 text-surface-500 hidden sm:table-cell">{tx.cryptoNetwork}</td>
                    <td className="px-6 py-4 text-surface-500">{formatDate(tx.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={
                        tx.status === 'approved' ? 'badge-success' :
                        tx.status === 'pending' ? 'badge-warning' : 'badge-danger'
                      }>
                        {t(`transactions.${tx.status}`)}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-surface-400">
                    {t('transactions.noTransactions')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowDepositModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-surface-900">{t('deposit.title')}</h3>
                  <button onClick={() => setShowDepositModal(false)} className="text-surface-400 hover:text-surface-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-surface-500 text-sm mb-6">{t('deposit.subtitle')}</p>

                {/* Select Address */}
                <div className="space-y-3 mb-4">
                  <label className="block text-sm font-medium text-surface-700">{t('deposit.selectAddress')}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {depositAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          selectedAddress === addr.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-surface-200 hover:border-primary-200'
                        }`}
                      >
                        <p className="font-medium text-surface-900 text-sm">{addr.name}</p>
                        <p className="text-xs text-surface-400 mt-1">{addr.network}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show selected address */}
                {selectedAddress && (() => {
                  const addr = depositAddresses.find((a) => a.id === selectedAddress);
                  if (!addr) return null;
                  return (
                    <div className="bg-surface-50 rounded-xl p-4 mb-4">
                      <p className="text-xs text-surface-400 mb-1">{t('deposit.network')}: {addr.network}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-surface-700 flex-1 break-all">{addr.address}</p>
                        <button
                          onClick={() => copyAddress(addr.address, addr.id)}
                          className="shrink-0 p-2 bg-white rounded-lg border border-surface-200 hover:border-primary-200 transition-colors"
                        >
                          {copiedId === addr.id ? (
                            <Check className="w-4 h-4 text-accent-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-surface-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Amount */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">{t('deposit.amount')}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-medium">$</span>
                    <input
                      type="number"
                      className="input-field pl-8"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
                  <p className="text-amber-700 text-xs">{t('deposit.warning')}</p>
                </div>

                <motion.button
                  onClick={handleDeposit}
                  disabled={!selectedAddress || !depositAmount}
                  className="w-full btn-accent disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {t('deposit.submitDeposit')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowWithdrawModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-surface-900">{t('withdraw.title')}</h3>
                  <button onClick={() => setShowWithdrawModal(false)} className="text-surface-400 hover:text-surface-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-surface-500 text-sm mb-6">{t('withdraw.subtitle')}</p>

                <div className="bg-surface-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-surface-400 mb-1">{t('withdraw.availableBalance')}</p>
                  <p className="text-2xl font-bold text-surface-900">{formatCurrency(currentUser?.balance || 0)}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">{t('withdraw.amount')}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-medium">$</span>
                    <input
                      type="number"
                      className="input-field pl-8"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      max={currentUser?.balance || 0}
                    />
                  </div>
                  <p className="text-xs text-surface-400 mt-2">{t('withdraw.minimumAmount')}</p>
                </div>

                {currentUser?.cryptoAddress && (
                  <div className="bg-surface-50 rounded-xl p-4 mb-6">
                    <p className="text-xs text-surface-400 mb-1">Withdrawal to:</p>
                    <p className="text-sm font-medium text-surface-700">{currentUser.cryptoAddress}</p>
                    <p className="text-xs text-surface-400 mt-1">{currentUser.cryptoNetwork}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setShowWithdrawModal(false)} className="flex-1 btn-secondary">
                    {t('withdraw.cancel')}
                  </button>
                  <motion.button
                    onClick={handleWithdraw}
                    disabled={
                      !withdrawAmount ||
                      parseFloat(withdrawAmount) <= 0 ||
                      parseFloat(withdrawAmount) > (currentUser?.balance || 0)
                    }
                    className="flex-1 btn-primary disabled:opacity-50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {t('withdraw.confirm')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
