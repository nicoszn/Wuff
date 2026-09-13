import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../stores/useStore';
import { changeLanguage, enableAutoDetect, isAutoDetectEnabled, getBrowserLanguages } from '../i18n';
import { motion } from 'framer-motion';
import { User, Mail, Wallet, Globe, Save, Check, Radar, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { currentUser, updateProfile, languages } = useStore();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cryptoAddress: '',
    cryptoNetwork: '',
    cryptoName: '',
  });
  const [saved, setSaved] = useState(false);
  const [autoDetect, setAutoDetect] = useState(isAutoDetectEnabled());
  const [detectedLang, setDetectedLang] = useState('');

  useEffect(() => {
    if (currentUser) {
      setForm({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        cryptoAddress: currentUser.cryptoAddress || '',
        cryptoNetwork: currentUser.cryptoNetwork || '',
        cryptoName: currentUser.cryptoName || '',
      });
    }
  }, [currentUser]);

  // On mount, compute the detected language for display
  useEffect(() => {
    const browserLangs = getBrowserLanguages();
    if (browserLangs.length > 0) {
      setDetectedLang(browserLangs[0]);
    }
  }, []);

  const handleSave = () => {
    updateProfile(form);
    toast.success(t('settings.saved'));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLanguageChange = (code: string) => {
    changeLanguage(code);
    setAutoDetect(false);
  };

  const handleAutoDetectToggle = () => {
    const newAuto = !autoDetect;
    setAutoDetect(newAuto);
    if (newAuto) {
      const detected = enableAutoDetect();
      const lang = languages.find((l) => l.code === detected);
      toast.success(
        lang
          ? `Switched to ${lang.name} based on your browser`
          : `No match found — using English`
      );
    } else {
      // Turning auto off keeps current language
      localStorage.setItem('portbuff-lang-auto', 'false');
    }
  };

  const enabledLanguages = languages.filter((l) => l.enabled);

  // Find the currently active language details
  const activeLang = enabledLanguages.find((l) => l.code === i18n.language);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-2xl">
      <motion.div variants={item}>
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-900">{t('settings.title')}</h1>
        <p className="text-surface-500 mt-1">{t('settings.subtitle')}</p>
      </motion.div>

      {/* Personal Info */}
      <motion.div variants={item} className="card">
        <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" />
          {t('settings.personalInfo')}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                {t('settings.firstName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                {t('settings.lastName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              {t('settings.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="email"
                className="input-field pl-10"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Crypto Info */}
      <motion.div variants={item} className="card">
        <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary-600" />
          {t('settings.cryptoInfo')}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              {t('settings.cryptoAddress')}
            </label>
            <input
              type="text"
              className="input-field font-mono text-sm"
              value={form.cryptoAddress}
              onChange={(e) => setForm({ ...form, cryptoAddress: e.target.value })}
              placeholder="0x..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                {t('settings.cryptoNetwork')}
              </label>
              <select
                className="input-field"
                value={form.cryptoNetwork}
                onChange={(e) => setForm({ ...form, cryptoNetwork: e.target.value })}
              >
                <option value="">Select network</option>
                <option value="Ethereum (ERC-20)">Ethereum (ERC-20)</option>
                <option value="BSC (BEP-20)">BSC (BEP-20)</option>
                <option value="Tron (TRC-20)">Tron (TRC-20)</option>
                <option value="Bitcoin">Bitcoin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                {t('settings.cryptoName')}
              </label>
              <select
                className="input-field"
                value={form.cryptoName}
                onChange={(e) => setForm({ ...form, cryptoName: e.target.value })}
              >
                <option value="">Select crypto</option>
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Language */}
      <motion.div variants={item} className="card">
        <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary-600" />
          {t('settings.language')}
        </h3>

        {/* Auto-detect toggle */}
        <div className="mb-4 p-4 bg-surface-50 rounded-xl border border-surface-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${autoDetect ? 'bg-accent-100' : 'bg-surface-200'}`}>
                <Radar className={`w-4 h-4 ${autoDetect ? 'text-accent-600' : 'text-surface-500'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900">Auto-detect language</p>
                <p className="text-xs text-surface-400">
                  {autoDetect
                    ? "Switches to match your browser’s preferred language"
                    : "Off — manual selection active"}
                </p>
              </div>
            </div>
            <button
              onClick={handleAutoDetectToggle}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                autoDetect ? 'bg-accent-500' : 'bg-surface-300'
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                animate={{ left: autoDetect ? '26px' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
          {detectedLang && (
            <div className="mt-3 flex items-center gap-2 text-xs text-surface-400">
              <Monitor className="w-3.5 h-3.5" />
              <span>
                Browser reports: <span className="font-mono font-medium text-surface-600">{detectedLang}</span>
              </span>
              {autoDetect && activeLang && (
                <span className="text-accent-600 font-medium">
                  → matched to {activeLang.name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Manual language selection */}
        <div className="space-y-2">
          {enabledLanguages.map((lang) => {
            const isActive = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                  isActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-surface-200 hover:border-primary-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    isActive ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-500'
                  }`}>
                    {lang.nativeName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">{lang.name}</p>
                    <p className="text-xs text-surface-400">{lang.nativeName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isActive && autoDetect && (
                    <span className="text-[10px] font-medium text-accent-600 bg-accent-100 px-1.5 py-0.5 rounded-full">
                      AUTO
                    </span>
                  )}
                  {isActive && <Check className="w-5 h-5 text-primary-600" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Info note */}
        <p className="mt-4 text-xs text-surface-400">
          {autoDetect
            ? "Auto-detect matches your browser’s first preferred language against available languages. Turn it off to lock to a manual choice."
            : "Pick a language above. Your choice is saved and remembered across visits."}
        </p>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={item}>
        <motion.button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {t('settings.saveChanges')}
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
