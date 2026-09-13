import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Zap,
  Wheat,
  Gem,
  Building2,
  Cpu,
  Landmark,
  Check,
  TrendingUp,
  Wallet,
  BarChart3,
  DollarSign,
  ArrowUpRight,
  Globe,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

// ── Navbar ──
function LandingNavbar() {
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const languages = [
    { code: 'en-US', label: 'EN' },
    { code: 'es-ES', label: 'ES' },
  ];
  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-100"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="text-xl font-bold text-surface-900">
            Port<span className="text-primary-600">buff</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-surface-500 hover:text-primary-600 transition-colors">
            {t('nav.features')}
          </a>
          <a href="#plans" className="text-sm text-surface-500 hover:text-primary-600 transition-colors">
            {t('nav.plans')}
          </a>
          <a href="#dashboard-preview" className="text-sm text-surface-500 hover:text-primary-600 transition-colors">
            {t('nav.dashboard')}
          </a>

          <div className="relative group">
            <button className="flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-1.5 text-sm text-surface-500 hover:border-primary-300 hover:text-primary-600 transition-colors">
              <Globe className="h-3.5 w-3.5" />
              {currentLang.label}
            </button>
            <div className="absolute right-0 top-full mt-1 hidden w-24 rounded-xl border border-surface-100 bg-white py-1 shadow-lg group-hover:block">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`block w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-surface-50 ${
                    i18n.language === lang.code ? 'text-primary-600 font-medium' : 'text-surface-500'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <a href="/auth" className="text-sm text-surface-600 hover:text-surface-900 transition-colors">
            {t('nav.login')}
          </a>
          <a
            href="/auth"
            className="btn-primary !py-2 !px-4 !text-sm"
          >
            {t('nav.signup')}
          </a>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-surface-500 md:hidden">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-surface-100 bg-white px-4 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#features" onClick={() => setMobileOpen(false)} className="text-sm text-surface-600">
              {t('nav.features')}
            </a>
            <a href="#plans" onClick={() => setMobileOpen(false)} className="text-sm text-surface-600">
              {t('nav.plans')}
            </a>
            <a href="#dashboard-preview" onClick={() => setMobileOpen(false)} className="text-sm text-surface-600">
              {t('nav.dashboard')}
            </a>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`rounded-lg px-2 py-1 text-xs ${
                    i18n.language === lang.code
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-surface-400 hover:text-surface-600'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <a href="/auth" className="btn-secondary !py-2 !px-4 !text-sm">
                {t('nav.login')}
              </a>
              <a href="/auth" className="btn-primary !py-2 !px-4 !text-sm">
                {t('nav.signup')}
              </a>
            </div>
          </div>
        </div>
      )}
    </motion.nav>
  );
}

// ── Hero ──
function Hero() {
  const { t } = useTranslation();
  const stats = [
    { key: 'statInvestors', value: '10,000+' },
    { key: 'statInvested', value: '$240M+' },
    { key: 'statReturn', value: '18.4%' },
    { key: 'statCountries', value: '52' },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/5 blur-[128px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5"
          >
            <Shield className="h-3.5 w-3.5 text-primary-600" />
            <span className="text-xs font-medium tracking-wide text-primary-700 uppercase">
              {t('landing.badge')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-surface-900 sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {t('landing.heroTitle')}{' '}
            <span className="text-primary-600">{t('landing.heroTitleHighlight')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-surface-500"
          >
            {t('landing.heroSubtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <a href="/auth" className="btn-primary group flex items-center justify-center gap-2 !px-8 !py-3.5 !text-base">
              {t('landing.ctaStart')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#features"
              className="btn-secondary group flex items-center justify-center gap-2 !px-8 !py-3.5 !text-base"
            >
              <Zap className="h-4 w-4 text-primary-500" />
              {t('landing.ctaExplore')}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                className="stat-card text-center hover:shadow-md hover:border-primary-100 transition-all"
              >
                <div className="text-2xl font-bold text-surface-900 sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-xs text-surface-400">{t(`landing.${stat.key}`)}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Features ──
const featureIcons = [
  { key: 'Agriculture', Icon: Wheat, color: 'text-green-500', bg: 'bg-green-50' },
  { key: 'Minerals', Icon: Gem, color: 'text-amber-500', bg: 'bg-amber-50' },
  { key: 'Energy', Icon: Zap, color: 'text-primary-500', bg: 'bg-primary-50' },
  { key: 'RealEstate', Icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50' },
  { key: 'Technology', Icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-50' },
  { key: 'Infrastructure', Icon: Landmark, color: 'text-cyan-500', bg: 'bg-cyan-50' },
];

function Features() {
  const { t } = useTranslation();

  return (
    <section id="features" className="relative py-32 bg-surface-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-xs font-medium tracking-wide text-primary-700 uppercase"
          >
            {t('landing.featuresLabel')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl lg:text-5xl"
          >
            {t('landing.featuresTitle')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-surface-500"
          >
            {t('landing.featuresSubtitle')}
          </motion.p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureIcons.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="card-hover"
            >
              <div className={`mb-5 inline-flex rounded-xl p-3 ${f.bg}`}>
                <f.Icon className={`h-6 w-6 ${f.color}`} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-surface-900">
                {t(`landing.feat${f.key}`)}
              </h3>
              <p className="text-sm leading-relaxed text-surface-500">
                {t(`landing.feat${f.key}Desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Plans ──
const planData = [
  { key: 'Starter', features: [1, 2, 3, 4], popular: false },
  { key: 'Growth', features: [1, 2, 3, 4, 5], popular: true },
  { key: 'Premium', features: [1, 2, 3, 4, 5, 6], popular: false },
];

function Plans() {
  const { t } = useTranslation();

  return (
    <section id="plans" className="relative py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-xs font-medium tracking-wide text-primary-700 uppercase"
          >
            {t('landing.plansLabel')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl lg:text-5xl"
          >
            {t('landing.plansTitle')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-surface-500"
          >
            {t('landing.plansSubtitle')}
          </motion.p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {planData.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className={`relative rounded-2xl border p-8 transition-all ${
                plan.popular
                  ? 'border-primary-200 bg-primary-50/50 shadow-lg scale-[1.02]'
                  : 'border-surface-100 bg-white hover:border-surface-200 hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  {t(`landing.plan${plan.key}Highlight`)}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-surface-900">
                  {t(`landing.plan${plan.key}`)}
                </h3>
                <p className="mt-1 text-xs text-surface-400">
                  {t(`landing.plan${plan.key}Highlight`)}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-primary-600' : 'text-surface-900'}`}>
                    {t(`landing.plan${plan.key}Price`)}
                  </span>
                  <span className="text-sm text-surface-400">
                    /{t(`landing.plan${plan.key}Min`)}
                  </span>
                </div>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((n) => (
                  <li key={n} className="flex items-start gap-3">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${plan.popular ? 'text-primary-500' : 'text-surface-300'}`}
                    />
                    <span className="text-sm text-surface-600">
                      {t(`landing.plan${plan.key}F${n}`)}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="/auth"
                className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                  plan.popular
                    ? 'btn-primary !shadow-lg'
                    : 'btn-secondary'
                }`}
              >
                {t('landing.getStarted')}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Dashboard Preview ──
function DashboardPreview() {
  const { t } = useTranslation();

  const activities = [
    { titleKey: 'dashAgriFund', returnKey: 'dashAgriReturn' },
    { titleKey: 'dashSolarProject', returnKey: 'dashSolarReturn' },
    { titleKey: 'dashGoldMining', returnKey: 'dashGoldReturn' },
  ];

  const portfolio = [
    { key: 'dashPortAgri', pct: 35, color: 'bg-green-400' },
    { key: 'dashPortEnergy', pct: 25, color: 'bg-primary-400' },
    { key: 'dashPortMinerals', pct: 20, color: 'bg-amber-400' },
    { key: 'dashPortRE', pct: 12, color: 'bg-blue-400' },
    { key: 'dashPortTech', pct: 8, color: 'bg-purple-400' },
  ];

  return (
    <section id="dashboard-preview" className="relative py-32 bg-surface-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-xs font-medium tracking-wide text-primary-700 uppercase"
          >
            {t('landing.dashLabel')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl lg:text-5xl"
          >
            {t('landing.dashTitle')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-surface-500"
          >
            {t('landing.dashSubtitle')}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-16"
        >
          <div className="relative overflow-hidden rounded-2xl border border-surface-100 bg-white p-1 shadow-2xl shadow-surface-900/5">
            {/* Window Chrome */}
            <div className="flex items-center gap-2 border-b border-surface-100 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
              <div className="h-3 w-3 rounded-full bg-green-400/60" />
            </div>

            <div className="p-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'dashTotalValue', value: '$142,580', Icon: Wallet, change: '+12.4%' },
                  { label: 'dashTotalReturn', value: '+$18,420', Icon: TrendingUp, change: '+18.4%' },
                  { label: 'dashActiveInv', value: '12', Icon: BarChart3, change: '+2' },
                  { label: 'dashMonthlyIncome', value: '$3,240', Icon: DollarSign, change: '+8.2%' },
                ].map((metric) => (
                  <div key={metric.label} className="stat-card">
                    <div className="flex items-center justify-between">
                      <metric.Icon className="h-4 w-4 text-surface-300" />
                      <span className="flex items-center gap-0.5 text-xs font-medium text-accent-600">
                        <ArrowUpRight className="h-3 w-3" />
                        {metric.change}
                      </span>
                    </div>
                    <div className="mt-2 text-xl font-bold text-surface-900">{metric.value}</div>
                    <div className="mt-0.5 text-xs text-surface-400">{t(`landing.${metric.label}`)}</div>
                  </div>
                ))}
              </div>

              {/* Bottom Row */}
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="card">
                  <h4 className="mb-4 text-sm font-semibold text-surface-900">
                    {t('landing.dashRecentActivity')}
                  </h4>
                  <div className="space-y-3">
                    {activities.map((a) => (
                      <div key={a.titleKey} className="flex items-center justify-between rounded-lg bg-surface-50 px-4 py-3">
                        <span className="text-sm text-surface-600">{t(`landing.${a.titleKey}`)}</span>
                        <span className="text-xs font-medium text-accent-600">{t(`landing.${a.returnKey}`)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h4 className="mb-4 text-sm font-semibold text-surface-900">
                    {t('landing.dashPortfolio')}
                  </h4>
                  <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-surface-100">
                    {portfolio.map((seg) => (
                      <div key={seg.key} className={`h-full ${seg.color}`} style={{ width: `${seg.pct}%` }} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {portfolio.map((seg) => (
                      <div key={seg.key} className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
                        <span className="text-xs text-surface-500">
                          {t(`landing.${seg.key}`)} ({seg.pct}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── CTA ──
function CTA() {
  const { t } = useTranslation();

  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-white p-12 text-center sm:p-16"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/10 blur-[80px]" />
          </div>
          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl lg:text-5xl"
            >
              {t('landing.ctaTitle')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mx-auto mt-4 max-w-xl text-surface-500"
            >
              {t('landing.ctaSubtitle')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <a href="/auth" className="btn-primary group inline-flex items-center gap-2 !px-8 !py-3.5 !text-base">
                {t('landing.ctaButton')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Footer ──
function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-surface-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="text-xl font-bold text-surface-900">
                Port<span className="text-primary-600">buff</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-surface-400">
              {t('landing.footerDesc')}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-surface-900 uppercase tracking-wider">
              {t('landing.footerPlatform')}
            </h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-sm text-surface-400 hover:text-primary-600 transition-colors">{t('nav.features')}</a></li>
              <li><a href="#plans" className="text-sm text-surface-400 hover:text-primary-600 transition-colors">{t('nav.plans')}</a></li>
              <li><a href="#dashboard-preview" className="text-sm text-surface-400 hover:text-primary-600 transition-colors">{t('nav.dashboard')}</a></li>
              <li><a href="/auth" className="text-sm text-surface-400 hover:text-primary-600 transition-colors">{t('nav.signup')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-surface-900 uppercase tracking-wider">
              {t('landing.footerCompany')}
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-surface-400 hover:text-primary-600 transition-colors">{t('landing.footerAbout')}</a></li>
              <li><a href="#" className="text-sm text-surface-400 hover:text-primary-600 transition-colors">{t('landing.footerCareers')}</a></li>
              <li><a href="#" className="text-sm text-surface-400 hover:text-primary-600 transition-colors">{t('landing.footerBlog')}</a></li>
              <li><a href="#" className="text-sm text-surface-400 hover:text-primary-600 transition-colors">{t('landing.footerHelp')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-surface-900 uppercase tracking-wider">
              {t('landing.footerLegal')}
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-surface-400 hover:text-primary-600 transition-colors">{t('landing.footerTerms')}</a></li>
              <li><a href="#" className="text-sm text-surface-400 hover:text-primary-600 transition-colors">{t('landing.footerPrivacy')}</a></li>
              <li><a href="#" className="text-sm text-surface-400 hover:text-primary-600 transition-colors">{t('landing.footerRisk')}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-surface-100 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-surface-400">{t('landing.footerCopyright')}</p>
            <p className="text-xs text-surface-400">{t('landing.footerDisclaimer')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Landing Page ──
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <main>
        <Hero />
        <Features />
        <Plans />
        <DashboardPreview />
        <CTA />
      </main>
      <LandingFooter />
    </div>
  );
}
