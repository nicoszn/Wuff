"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { ALL_COINS, type Timeframe } from "@/lib/crypto";
import { buildDashboardSignals } from "@/lib/signals";
import { TimeframeSelector } from "@/components/timeframe-selector";
import { RegimeCard } from "@/components/regime-card";
import { PairCard } from "@/components/pair-card";

function SkeletonCard() {
  return <div className="h-[172px] animate-shimmer rounded-2xl border border-surface-border bg-surface-raised" />;
}

function SkeletonRow() {
  return <div className="h-[60px] animate-shimmer rounded-xl border border-surface-border bg-surface-raised" />;
}

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("4h");

  const { data, isLoading, isError, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: ["dashboard-signals", timeframe],
    queryFn: () => buildDashboardSignals(timeframe),
    refetchInterval: 60_000,
  });

  const activePairs = data?.pairs.filter((p) => p.result.strength !== "None") ?? [];

  return (
    <main className="min-h-screen bg-surface px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-display font-bold text-text-primary">Wuff</h1>
            <p className="text-caption text-text-secondary">Regime detection &amp; cointegration signals</p>
          </div>
          <button
            onClick={() => refetch()}
            aria-label="Refresh"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-surface-border text-text-secondary focus-visible:outline-none"
          >
            <motion.span
              animate={isFetching ? { rotate: 360 } : { rotate: 0 }}
              transition={isFetching ? { repeat: Infinity, duration: 0.8, ease: "linear" } : {}}
            >
              <RefreshCw size={16} />
            </motion.span>
          </button>
        </header>

        <div className="mb-6">
          <TimeframeSelector value={timeframe} onChange={setTimeframe} />
        </div>

        {isError && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-halted p-3 text-caption text-halted">
            <AlertTriangle size={16} />
            Couldn&apos;t load market data. Pull to refresh.
          </div>
        )}

        <section className="mb-8">
          <h2 className="mb-3 text-heading font-semibold text-text-primary">Regimes</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading || !data
              ? ALL_COINS.map((c) => <SkeletonCard key={c.id} />)
              : data.assets.map((signal, i) => <RegimeCard key={signal.coin.id} signal={signal} index={i} />)}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-heading font-semibold text-text-primary">Cointegrated pairs</h2>
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {isLoading || !data
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                : activePairs.map((pair, i) => (
                    <PairCard key={`${pair.asset1.id}-${pair.asset2.id}`} pair={pair} index={i} />
                  ))}
            </AnimatePresence>
            {data && activePairs.length === 0 && (
              <p className="text-caption text-text-secondary">No cointegrated pairs at this timeframe.</p>
            )}
          </div>
        </section>

        {data && (
          <p className="mt-6 text-center text-caption text-text-secondary">
            Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
          </p>
        )}
      </div>
    </main>
  );
}
