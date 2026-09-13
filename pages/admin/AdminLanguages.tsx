import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../stores/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Globe, Languages, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';
import { generateId } from '../../utils/helpers';
import toast from 'react-hot-toast';
import TranslationEditor from '../../components/TranslationEditor';
import { defaultTranslations } from '../../i18n/locales/defaultTranslations';

export default function AdminLanguages() {
  const { t } = useTranslation();
  const { languages, addLanguage, updateLanguage, deleteLanguage } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingLang, setEditingLang] = useState<string | null>(null);
  const [translateLang, setTranslateLang] = useState<{ code: string; name: string } | null>(null);
  const [form, setForm] = useState({
    code: '',
    name: '',
    nativeName: '',
    enabled: true,
  });

  const openCreate = () => {
    setEditingLang(null);
    setForm({ code: '', name: '', nativeName: '', enabled: true });
    setShowModal(true);
  };

  const openEdit = (code: string) => {
    const lang = languages.find((l) => l.code === code);
    if (!lang) return;
    setEditingLang(code);
    setForm({ code: lang.code, name: lang.name, nativeName: lang.nativeName, enabled: lang.enabled });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.code || !form.name || !form.nativeName) {
      toast.error('All fields are required');
      return;
    }

    if (editingLang) {
      updateLanguage(editingLang, { name: form.name, nativeName: form.nativeName, enabled: form.enabled });
      toast.success('Language updated!');
    } else {
      if (languages.find((l) => l.code === form.code)) {
        toast.error('Language code already exists');
        return;
      }
      addLanguage({
        code: form.code,
        name: form.name,
        nativeName: form.nativeName,
        enabled: form.enabled,
        translations: {},
      });
      toast.success('Language created!');
    }
    setShowModal(false);
  };

  const handleDelete = (code: string) => {
    if (code === 'en-US') {
      toast.error('Cannot delete the default language');
      return;
    }
    if (window.confirm(t('admin.confirmDelete'))) {
      deleteLanguage(code);
      toast.success('Language deleted!');
    }
  };

  const toggleEnabled = (code: string) => {
    const lang = languages.find((l) => l.code === code);
    if (lang) {
      updateLanguage(code, { enabled: !lang.enabled });
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
          <h1 className="text-2xl lg:text-3xl font-bold text-surface-900">{t('admin.manageLanguages')}</h1>
          <p className="text-surface-500 mt-1">{languages.length} languages configured</p>
        </div>
        <motion.button onClick={openCreate} className="btn-primary flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Plus className="w-4 h-4" />
          {t('admin.createLanguage')}
        </motion.button>
      </motion.div>

      {/* Languages Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {languages.map((lang) => (
          <motion.div
            key={lang.code}
            variants={item}
            className="card group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-surface-900">{lang.name}</h3>
                  <p className="text-sm text-surface-400">{lang.nativeName}</p>
                </div>
              </div>
              <button
                onClick={() => toggleEnabled(lang.code)}
                className="text-surface-400 hover:text-primary-600 transition-colors"
              >
                {lang.enabled ? (
                  <ToggleRight className="w-8 h-8 text-accent-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-surface-400 mb-3">
              <span className="font-mono bg-surface-100 px-2 py-0.5 rounded">{lang.code}</span>
              <span className={lang.enabled ? 'text-accent-600 font-medium' : 'text-surface-400'}>
                {lang.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setTranslateLang({ code: lang.code, name: lang.name })} className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1">
                <Pencil className="w-3 h-3" />
                Translate
              </button>
              <button onClick={() => { setEditingLang(lang.code); setForm({ code: lang.code, name: lang.name, nativeName: lang.nativeName, enabled: lang.enabled }); setShowModal(true); }} className="btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1">
                <Edit2 className="w-3 h-3" />
              </button>
              {lang.code !== 'en-US' && (
                <button onClick={() => handleDelete(lang.code)} className="btn-danger text-xs py-2 px-3 flex items-center justify-center gap-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Translation Guide */}
      <motion.div variants={item} className="card">
        <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <Languages className="w-5 h-5 text-primary-600" />
          Translation Guide
        </h3>
        <p className="text-sm text-surface-500 mb-4">
          Click <strong>Translate</strong> on any language card above to open the full translation editor.
          You can search keys, fill with English text, import/export JSON, and save directly to i18next.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {Object.keys(defaultTranslations).map((section) => (
            <div key={section} className="bg-surface-50 rounded-lg px-3 py-2 text-sm">
              <span className="font-mono text-xs text-surface-600">{section}</span>
              <span className="text-xs text-surface-400 ml-1">({Object.keys(defaultTranslations[section]).length})</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-surface-900">
                    {editingLang ? t('admin.editLanguage') : t('admin.createLanguage')}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-surface-400 hover:text-surface-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">{t('admin.languageCode')}</label>
                    <input
                      type="text"
                      className="input-field font-mono"
                      placeholder="e.g., fr-FR, de-DE, zh-CN"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      disabled={!!editingLang}
                    />
                    <p className="text-xs text-surface-400 mt-1">Use BCP 47 format (e.g., fr-FR, de-DE, pt-BR)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">{t('admin.languageName')}</label>
                    <input type="text" className="input-field" placeholder="e.g., French" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">{t('admin.nativeName')}</label>
                    <input type="text" className="input-field" placeholder="e.g., Français" value={form.nativeName} onChange={(e) => setForm({ ...form, nativeName: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setForm({ ...form, enabled: !form.enabled })} className="text-surface-400">
                      {form.enabled ? <ToggleRight className="w-8 h-8 text-accent-500" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                    <span className="text-sm text-surface-600">{form.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">{t('common.cancel')}</button>
                  <button onClick={handleSave} className="flex-1 btn-primary">{editingLang ? t('common.save') : t('common.create')}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Translation Editor Modal */}
      <AnimatePresence>
        {translateLang && (
          <TranslationEditor
            languageCode={translateLang.code}
            languageName={translateLang.name}
            onClose={() => setTranslateLang(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
