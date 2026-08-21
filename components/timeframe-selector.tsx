"use client";

import { motion } from "framer-motion";
import { TIMEFRAMES, TIMEFRAME_CONFIG, type Timeframe } from "@/lib/crypto";

interface TimeframeSelectorProps {
  value: Timeframe;
  onChange: (tf: Timeframe) => void;
}

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Timeframe"
      className="relative flex rounded-xl border border-surface-border bg-surface-raised p-1"
    >
      {TIMEFRAMES.map((tf) => {
        const active = tf === value;
        return (
          <button
            key={tf}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tf)}
            className={`relative z-10 flex-1 rounded-lg py-2 text-caption font-semibold transition-colors focus-visible:outline-none ${
              active ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            {active && (
              <motion.div
                layoutId="timeframe-pill"
                className="absolute inset-0 -z-10 rounded-lg bg-signal/15 border border-signal/40"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {TIMEFRAME_CONFIG[tf].label}
          </button>
        );
      })}
    </div>
  );
}
