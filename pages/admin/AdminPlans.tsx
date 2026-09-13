import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../stores/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, TrendingUp, Palette } from 'lucide-react';
import { formatCurrency, generateId } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminPlans() {
  const { t } = useTranslation();
  const { plans, addPlan, updatePlan, deletePlan } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    minCapital: 0,
    maxCapital: 0,
    dailyPercentage: 0,
    days: 4,
    description: '',
    color: 'from-blue-500 to-cyan-400',
    icon: '🚀',
  });

  const colorOptions = [
    'from-blue-500 to-cyan-400',
    'from-purple-500 to-pink-400',
    'from-amber-500 to-orange-400',
    'from-green-500 to-emerald-400',
    'from-red-500 to-rose-400',
    'from-indigo-500 to-blue-400',
  ];

  const iconOptions = ['🚀', '💎', '👑', '⭐', '💰', '🎯', '🔥', '✨'];

  const openCreate = () => {
    setEditingPlan(null);
    setForm({ name: '', minCapital: 0, maxCapital: 0, dailyPercentage: 0, days: 4, description: '', color: 'from-blue-500 to-cyan-400', icon: '🚀' });
    setShowModal(true);
  };

  const openEdit = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    setEditingPlan(planId);
    setForm({ ...plan });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingPlan) {
      updatePlan(editingPlan, form);
      toast.success('Plan updated!');
    } else {
      addPlan({ id: generateId(), ...form });
      toast.success('Plan created!');
    }
    setShowModal(false);
  };

  const handleDelete = (planId: string) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      deletePlan(planId);
      toast.success('Plan deleted!');
    }
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
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-surface-900">{t('admin.managePlans')}</h1>
          <p className="text-surface-500 mt-1">{plans.length} plans total</p>
        </div>
        <motion.button onClick={openCreate} className="btn-primary flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Plus className="w-4 h-4" />
          {t('admin.createPlan')}
        </motion.button>
      </motion.div>

      {/* Plans Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            variants={item}
            className="bg-white rounded-2xl border border-surface-100 overflow-hidden shadow-sm"
          >
            <div className={`bg-gradient-to-r ${plan.color} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl">{plan.icon}</span>
                  <h3 className="text-lg font-bold mt-1">{plan.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(plan.id)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="p-1.5 bg-white/20 rounded-lg hover:bg-red-500/80 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-surface-500">Min Capital</span><span className="font-medium">{formatCurrency(plan.minCapital)}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Max Capital</span><span className="font-medium">{formatCurrency(plan.maxCapital)}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Daily %</span><span className="font-medium text-accent-600">{plan.dailyPercentage}%</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Days</span><span className="font-medium">{plan.days}</span></div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-surface-900">{editingPlan ? t('admin.editPlan') : t('admin.createPlan')}</h3>
                  <button onClick={() => setShowModal(false)} className="text-surface-400 hover:text-surface-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Name</label>
                      <input type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Daily %</label>
                      <input type="number" className="input-field" value={form.dailyPercentage} onChange={(e) => setForm({ ...form, dailyPercentage: parseFloat(e.target.value) || 0 })} step="0.1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Min Capital</label>
                      <input type="number" className="input-field" value={form.minCapital} onChange={(e) => setForm({ ...form, minCapital: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Max Capital</label>
                      <input type="number" className="input-field" value={form.maxCapital} onChange={(e) => setForm({ ...form, maxCapital: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Days</label>
                    <input type="number" className="input-field" value={form.days} onChange={(e) => setForm({ ...form, days: parseInt(e.target.value) || 4 })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
                    <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2 flex items-center gap-1"><Palette className="w-4 h-4" /> Color</label>
                    <div className="flex gap-2">
                      {colorOptions.map((c) => (
                        <button key={c} onClick={() => setForm({ ...form, color: c })} className={`w-8 h-8 rounded-full bg-gradient-to-r ${c} ${form.color === c ? 'ring-2 ring-offset-2 ring-primary-500' : ''}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Icon</label>
                    <div className="flex gap-2">
                      {iconOptions.map((ic) => (
                        <button key={ic} onClick={() => setForm({ ...form, icon: ic })} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 ${form.icon === ic ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-primary-200'}`}>
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">{t('common.cancel')}</button>
                  <button onClick={handleSave} className="flex-1 btn-primary">{editingPlan ? t('common.save') : t('common.create')}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
