/**
 * Crypto Data Fetcher
 *
 * Fetches historical price series from CoinGecko's free API and resamples
 * them into fixed-width buckets (1h / 4h / 1d) so the regime (HMM) and
 * cointegration (ADF) models always get a series long enough to fit
 * reliably — independent of how much of that series the UI displays.
 *
 * No API key required — subject to ~30 req/min rate limit.
 */

export interface Coin {
  id: string;
  symbol: string;
  name: string;
}

export const ALL_COINS: Coin[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "hyperliquid", symbol: "HYPE", name: "Hyperliquid" },
];

export type Timeframe = "1h" | "4h" | "7d" | "30d";

export const TIMEFRAMES: Timeframe[] = ["1h", "4h", "7d", "30d"];

export interface TimeframeConfig {
  label: string;
  /** Days of raw history pulled from CoinGecko — sized so the models have enough points to fit. */
  fetchDays: number;
  /** Bucket width (hours) that raw points get resampled into. */
  bucketHours: number;
  /** How many trailing buckets the UI actually charts. */
  displayPoints: number;
}

export const TIMEFRAME_CONFIG: Record<Timeframe, TimeframeConfig> = {
  "1h": { label: "1H", fetchDays: 7, bucketHours: 1, displayPoints: 24 },
  "4h": { label: "4H", fetchDays: 21, bucketHours: 4, displayPoints: 30 },
  "7d": { label: "7D", fetchDays: 90, bucketHours: 24, displayPoints: 7 },
  "30d": { label: "30D", fetchDays: 180, bucketHours: 24, displayPoints: 30 },
};

export interface PriceData {
  coin: Coin;
  /** Full resampled series used to fit the models (bucketed, ascending order). */
  prices: number[];
  dates: string[];
  /** Trailing slice of `prices` sized for the selected timeframe's chart. */
  displayPrices: number[];
  displayDates: string[];
}

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

interface MarketChartResponse {
  prices: [number, number][];
}

/** Groups raw [timestamp, price] points into fixed-width buckets, keeping the last price observed in each bucket. */
function resample(
  raw: [number, number][],
  bucketHours: number,
): { prices: number[]; dates: string[] } {
  const bucketMs = bucketHours * 60 * 60 * 1000;
  const buckets = new Map<number, number>();

  for (const [ts, price] of raw) {
    const bucketKey = Math.floor(ts / bucketMs) * bucketMs;
    buckets.set(bucketKey, price); // CoinGecko returns points in ascending order, so last write wins per bucket
  }

  const sortedKeys = [...buckets.keys()].sort((a, b) => a - b);
  const prices = sortedKeys.map((k) => buckets.get(k) as number);
  const dates = sortedKeys.map((k) => new Date(k).toISOString());

  return { prices, dates };
}

export async function fetchCoinHistory(
  coinId: string,
  timeframe: Timeframe,
): Promise<PriceData> {
  const config = TIMEFRAME_CONFIG[timeframe];
  const url = `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${config.fetchDays}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`CoinGecko API error for ${coinId}: ${res.status}`);
  }

  const data = (await res.json()) as MarketChartResponse;
  const { prices, dates } = resample(data.prices, config.bucketHours);

  const coin = ALL_COINS.find((c) => c.id === coinId);
  if (!coin) throw new Error(`Unknown coin id: ${coinId}`);

  const n = Math.min(config.displayPoints, prices.length);

  return {
    coin,
    prices,
    dates,
    displayPrices: prices.slice(-n),
    displayDates: dates.slice(-n),
  };
}

export async function fetchCoins(
  coinIds: string[],
  timeframe: Timeframe,
): Promise<PriceData[]> {
  const settled = await Promise.allSettled(
    coinIds.map((id) => fetchCoinHistory(id, timeframe)),
  );

  const results: PriceData[] = [];
  for (const outcome of settled) {
    if (outcome.status === "fulfilled") {
      results.push(outcome.value);
    } else {
      console.error("Failed to fetch coin history:", outcome.reason);
    }
  }
  return results;
}
