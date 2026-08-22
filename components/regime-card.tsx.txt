"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import type { AssetSignal } from "@/lib/signals";

interface RegimeStyle {
  badgeClass: string;
  barClass: string;
  strokeVar: string;
  Icon: LucideIcon;
}

const REGIME_STYLES: Record<string, RegimeStyle> = {
  Bull: {
    badgeClass: "bg-armed/15 text-armed",
    barClass: "bg-armed",
    strokeVar: "var(--color-armed)",
    Icon: TrendingUp,
  },
  Bear: {
    badgeClass: "bg-halted/15 text-halted",
    barClass: "bg-halted",
    strokeVar: "var(--color-halted)",
    Icon: TrendingDown,
  },
  Neutral: {
    badgeClass: "bg-inactive/15 text-inactive",
    barClass: "bg-inactive",
    strokeVar: "var(--color-inactive)",
    Icon: Minus,
  },
};

function Sparkline({ values, stroke }: { values: number[]; stroke: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-10 w-full">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={2.5}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RegimeCard({ signal, index }: { signal: AssetSignal; index: number }) {
  const style = REGIME_STYLES[signal.regime.currentRegime] ?? REGIME_STYLES.Neutral;
  const { Icon } = style;
  const up = signal.changePct >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04, ease: "easeOut" }}
      className="rounded-2xl border border-surface-border bg-surface-raised p-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption text-text-secondary">{signal.coin.name}</p>
          <p className="text-heading font-semibold text-text-primary">{signal.coin.symbol}</p>
        </div>
        <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-caption font-semibold ${style.badgeClass}`}>
          <Icon size={14} strokeWidth={2.5} />
          {signal.regime.currentRegime}
        </span>
      </div>

      <div className="mt-3">
        <Sparkline values={signal.priceData.displayPrices} stroke={style.strokeVar} />
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <p className="text-body font-semibold text-text-primary">
          $
          {signal.latestPrice.toLocaleString(undefined, {
            maximumFractionDigits: signal.latestPrice < 10 ? 4 : 2,
          })}
        </p>
        <p className={`text-caption font-semibold ${up ? "text-armed" : "text-halted"}`}>
          {up ? "+" : ""}
          {signal.changePct.toFixed(2)}%
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-caption text-text-secondary">
        <span>Confidence</span>
        <span>{Math.round(signal.regime.currentConfidence * 100)}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-border">
        <motion.div
          className={`h-full rounded-full ${style.barClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${signal.regime.currentConfidence * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
