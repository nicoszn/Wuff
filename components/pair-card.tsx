"use client";

import { motion } from "framer-motion";
import { Link2, Link2Off } from "lucide-react";
import type { PairSignal } from "@/lib/signals";

const STRENGTH_STYLE: Record<string, { chip: string; text: string }> = {
  Strong: { chip: "bg-armed/15", text: "text-armed" },
  Moderate: { chip: "bg-signal/15", text: "text-signal" },
  Weak: { chip: "bg-warning/15", text: "text-warning" },
  None: { chip: "bg-inactive/15", text: "text-inactive" },
};

export function PairCard({ pair, index }: { pair: PairSignal; index: number }) {
  // Provide a fallback to "None" style if strength is unrecognised
  const style = STRENGTH_STYLE[pair.result.strength] ?? STRENGTH_STYLE.None;
  const Icon = pair.result.isCointegrated ? Link2 : Link2Off;

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03, ease: "easeOut" }}
      className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-raised p-3"
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${style.chip} ${style.text}`}>
          <Icon size={16} strokeWidth={2.5} />
        </span>
        <div>
          <p className="text-body font-semibold text-text-primary">
            {pair.asset1.symbol} / {pair.asset2.symbol}
          </p>
          <p className="text-caption text-text-secondary">
            {pair.result.halfLifeDays ? `~${pair.result.halfLifeDays}d half-life` : "no clear mean reversion"}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className={`text-caption font-semibold ${style.text}`}>{pair.result.strength}</p>
        <p className="text-caption text-text-secondary">t = {pair.result.testStatistic.toFixed(2)}</p>
      </div>
    </motion.div>
  );
}
