/**
 * Signal Engine
 *
 * Couples the crypto data fetcher with the HMM regime model and the ADF
 * cointegration test, producing the two feeds the dashboard renders:
 *   1. Per-asset regime signals   (Bull / Neutral / Bear + confidence)
 *   2. Cross-asset pair signals   (which pairs are cointegrated right now)
 */

import { ALL_COINS, fetchCoins, type Coin, type PriceData, type Timeframe } from "./crypto";
import { runHMM, type RegimeResult } from "./hmm";
import { runADFTest, type ADFResult } from "./adf";

export interface AssetSignal {
  coin: Coin;
  regime: RegimeResult;
  priceData: PriceData;
  latestPrice: number;
  /** % change across the displayed (charted) window, not the full fit window. */
  changePct: number;
}

export interface PairSignal {
  asset1: Coin;
  asset2: Coin;
  result: ADFResult;
}

export interface DashboardSignals {
  assets: AssetSignal[];
  pairs: PairSignal[];
  timeframe: Timeframe;
  generatedAt: string;
}

const MIN_ADF_POINTS = 30;

function pctChange(series: number[]): number {
  if (series.length < 2) return 0;
  const first = series[0];
  const last = series[series.length - 1];
  if (first === 0) return 0;
  return ((last - first) / first) * 100;
}

export async function buildDashboardSignals(
  timeframe: Timeframe,
  coinIds: string[] = ALL_COINS.map((c) => c.id),
): Promise<DashboardSignals> {
  const priceData = await fetchCoins(coinIds, timeframe);

  const assets: AssetSignal[] = [];
  for (const pd of priceData) {
    try {
      const regime = runHMM(pd.prices);
      const prices = pd.prices;
      const latestPrice = prices.length > 0 ? prices[prices.length - 1] : 0;
      assets.push({
        coin: pd.coin,
        regime,
        priceData: pd,
        latestPrice,
        changePct: pctChange(pd.displayPrices),
      });
    } catch (err) {
      console.error(`HMM failed for ${pd.coin.symbol}:`, err);
    }
  }

  const pairs: PairSignal[] = [];
  for (let i = 0; i < priceData.length; i++) {
    for (let j = i + 1; j < priceData.length; j++) {
      const a = priceData[i];
      const b = priceData[j];
      // Ensure both have prices
      if (!a || !b) continue;
      const len = Math.min(a.prices.length, b.prices.length);
      if (len < MIN_ADF_POINTS) continue;

      try {
        const result = runADFTest(a.prices.slice(-len), b.prices.slice(-len));
        pairs.push({ asset1: a.coin, asset2: b.coin, result });
      } catch (err) {
        console.error(`ADF failed for ${a.coin.symbol}/${b.coin.symbol}:`, err);
      }
    }
  }

  // Most negative test statistic = strongest evidence of cointegration first.
  pairs.sort((x, y) => x.result.testStatistic - y.result.testStatistic);

  return {
    assets,
    pairs,
    timeframe,
    generatedAt: new Date().toISOString(),
  };
}
