import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../stores/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate, calculateProfit, generateId } from '../utils/helpers';
import { Check, X, TrendingUp, Clock, DollarSign, Percent, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Plans() {
  const { t } = useTranslation();
  const { plans, currentUser, updateProfile, addInvestment } = useStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const plan = plans.find((p) => p.id === selectedPlan);
  const amount = parseFloat(investAmount) || 0;

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setInvestAmount('');
    setShowModal(true);
  };

  const handleConfirmInvest = () => {
    if (!plan || !currentUser) return;
    if (amount < plan.minCapital || amount > plan.maxCapital) {
      toast.error(`${t('plans.minAmount')}: ${formatCurrency(plan.minCapital)}`);
      return;
    }
    if (amount > (currentUser.balance || 0)) {
      toast.error(t('plans.insufficientBalance'));
      return;
    }
    setShowConfirmModal(true);
  };

  const executeInvestment = () => {
    if (!plan || !currentUser) return;

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + plan.days);
    const estimatedProfit = calculateProfit(amount, plan.dailyPercentage, plan.days);

    const investment = {
      id: generateId(),
      userId: currentUser.id,
      planId: plan.id,
      amount,
      dailyPercentage: plan.dailyPercentage,
      days: plan.days,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      estimatedProfit,
      currentProfit: 0,
      status: 'active' as const,
    };

    addInvestment(investment);
    updateProfile({
      balance: (currentUser.balance || 0) - amount,
      totalInvested: (currentUser.totalInvested || 0) + amount,
      investmentId: investment.id,
    });

    setShowModal(false);
    setShowConfirmModal(false);
    setInvestAmount('');
    toast.success(t('plans.investmentSuccess'));
  };

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
      <motion.div variants={item}>
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-900">{t('plans.title')}</h1>
        <p className="text-surface-500 mt-1">{t('plans.subtitle')}</p>
      </motion.div>

      {/* Plans Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            variants={item}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative bg-white rounded-2xl border border-surface-100 overflow-hidden shadow-sm hover:shadow-lg transition-all"
          >
            {/* Plan Header */}
            <div className={`bg-gradient-to-r ${plan.color} p-6 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
              <div className="relative">
                <span className="text-3xl mb-3 block">{plan.icon}</span>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-white/80 text-sm mt-1">{plan.description}</p>
              </div>
            </div>

            {/* Plan Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-surface-100">
                <div className="flex items-center gap-2 text-surface-500 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>{t('plans.minCapital')}</span>
                </div>
                <span className="font-semibold text-surface-900">{formatCurrency(plan.minCapital)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-surface-100">
                <div className="flex items-center gap-2 text-surface-500 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>{t('plans.maxCapital')}</span>
                </div>
                <span className="font-semibold text-surface-900">{formatCurrency(plan.maxCapital)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-surface-100">
                <div className="flex items-center gap-2 text-surface-500 text-sm">
                  <Percent className="w-4 h-4" />
                  <span>{t('plans.dailyReturn')}</span>
                </div>
                <span className="font-semibold text-accent-600">{plan.dailyPercentage}%</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-surface-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{t('plans.duration')}</span>
                </div>
                <span className="font-semibold text-surface-900">
                  {plan.days} {t('plans.days')}
                </span>
              </div>

              <motion.button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full mt-4 bg-gradient-to-r ${plan.color} text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <TrendingUp className="w-4 h-4" />
                {t('plans.invest')}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Investment Modal */}
      <AnimatePresence>
        {showModal && plan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`bg-gradient-to-r ${plan.color} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="relative">
                  <span className="text-2xl mb-2 block">{plan.icon}</span>
                  <h3 className="text-xl font-bold">{plan.name} {t('plans.selectPlan')}</h3>
                  <p className="text-white/80 text-sm">
                    {t('plans.dailyReturn')}: {plan.dailyPercentage}% | {t('plans.duration')}: {plan.days} {t('plans.days')}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    {t('plans.investAmount')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-medium">$</span>
                    <input
                      type="number"
                      className="input-field pl-8 text-lg font-semibold"
                      placeholder="0.00"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      min={plan.minCapital}
                      max={plan.maxCapital}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-surface-400">
                    <span>{t('plans.minAmount')}: {formatCurrency(plan.minCapital)}</span>
                    <span>{t('plans.maxAmount')}: {formatCurrency(plan.maxCapital)}</span>
                  </div>
                </div>

                <div className="p-4 bg-surface-50 rounded-xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">{t('plans.availableBalance')}</span>
                    <span className="font-semibold text-surface-900">{formatCurrency(currentUser?.balance || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">{t('plans.estimatedProfit')}</span>
                    <span className="font-semibold text-accent-600">
                      {formatCurrency(calculateProfit(amount, plan.dailyPercentage, plan.days))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">{t('plans.totalReturn')}</span>
                    <span className="font-bold text-surface-900">
                      {formatCurrency(amount + calculateProfit(amount, plan.dailyPercentage, plan.days))}
                    </span>
                  </div>
                </div>

                <motion.button
                  onClick={handleConfirmInvest}
                  disabled={!amount || amount < plan.minCapital || amount > plan.maxCapital || amount > (currentUser?.balance || 0)}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: amount ? 1.01 : 1 }}
                  whileTap={{ scale: amount ? 0.99 : 1 }}
                >
                  <Check className="w-4 h-4" />
                  {t('plans.confirmInvestment')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && plan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-surface-900 mb-2">{t('plans.investmentSummary')}</h3>
                <p className="text-surface-500 text-sm mb-6">{t('plans.confirmInvestment')}</p>

                <div className="bg-surface-50 rounded-xl p-4 space-y-3 text-left mb-6">
                  <div className="flex justify-between">
                    <span className="text-surface-500">{t('plans.investAmount')}</span>
                    <span className="font-bold text-surface-900">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">{t('plans.dailyReturn')}</span>
                    <span className="font-semibold text-accent-600">{plan.dailyPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">{t('plans.duration')}</span>
                    <span className="font-semibold text-surface-900">{plan.days} {t('plans.days')}</span>
                  </div>
                  <div className="flex justify-between border-t border-surface-200 pt-3">
                    <span className="text-surface-500">{t('plans.startDate')}</span>
                    <span className="font-medium text-surface-900">{formatDate(new Date().toISOString())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">{t('plans.endDate')}</span>
                    <span className="font-medium text-surface-900">
                      {formatDate(new Date(Date.now() + plan.days * 86400000).toISOString())}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-surface-200 pt-3">
                    <span className="font-semibold text-surface-700">{t('plans.estimatedProfit')}</span>
                    <span className="font-bold text-accent-600 text-lg">
                      {formatCurrency(calculateProfit(amount, plan.dailyPercentage, plan.days))}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowConfirmModal(false)} className="flex-1 btn-secondary">
                    {t('common.cancel')}
                  </button>
                  <motion.button
                    onClick={executeInvestment}
                    className="flex-1 btn-primary"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {t('plans.confirmInvestment')}
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
