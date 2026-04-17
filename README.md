# Quant Terminal

Personal trading dashboard inspired by Bloomberg Terminal / TradingView.
**All market data is real, sourced live from public APIs. The portfolio is simulated** —
positions, trades, and equity curve are fictional but priced against the real market.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS, Radix UI primitives
- TradingView `lightweight-charts` for candles
- Recharts for sparklines and equity curve
- Zustand (with localStorage persistence) for the simulated portfolio
- TanStack Query for live data
- Native browser WebSocket multiplexer for Binance streaming

## Data sources

| Source                               | Used for                                | Auth          |
| ------------------------------------ | --------------------------------------- | ------------- |
| `api.binance.com` REST               | Crypto tickers, klines, depth snapshot  | None          |
| `wss://stream.binance.com:9443`      | Live crypto ticker + order-book stream  | None          |
| `yahoo-finance2` (npm)               | Stocks (AAPL, TSLA, NVDA, SPY)          | None          |
| `api.frankfurter.dev/v1`             | Forex pairs (EUR/USD, GBP/USD)          | None          |
| Bloomberg / WSJ / CoinDesk RSS       | News feed                               | None          |

Hover any number in the UI: a tooltip shows the source and how stale the value is.

## Running

```bash
npm install
npm run dev    # http://localhost:3000
npm run build && npm start
```

No environment variables required.

## Routes

- `/dashboard` — main grid (Watchlist, Chart, Order Book, Positions, News)
- `/positions` — full positions table + performance stats
- `/history` — equity curve + trade history + stats

## API proxy routes

All third-party calls go through `/app/api/*` so the browser never hits an
upstream directly (avoids CORS, hides Yahoo's user-agent quirks):

- `GET /api/tickers?symbols=BTC,ETH,…` — batched quotes (mixed sources)
- `GET /api/historical/[symbol]?tf=1h` — OHLCV candles
- `GET /api/depth/[symbol]` — order-book snapshot (crypto only)
- `GET /api/news` — aggregated RSS, cached 5 min
- `GET /api/historical-price?symbol=…&ts=…` — point-in-time price (used by the
  generator if you wire it up to backfill prices)

## Architecture

```
Browser                                                Server (Next API)
                                                       
┌─────────────┐   /api/tickers   ┌─────────────────┐   ┌──────────────┐
│ Watchlist   │ ───────────────► │ tickers/route   │──►│ binance.ts   │
│ Header      │                  └─────────────────┘   │ yahoo.ts     │
│ Positions   │                                        │ frankfurter  │
└─────────────┘                                        └──────────────┘
       │
       │   wss://stream.binance.com   (multiplexed)
       └────────────────────────────────────────────► Binance WS gateway
                  ▲                          
                  │ singleton, auto-reconnect
                  └─ subscribeTicker / subscribeDepth (lib/websocket/binance-ws.ts)

┌─────────────┐                                        
│ Portfolio   │ ───────► Zustand + localStorage (lib/portfolio/store.ts)
│ store       │ ───────► generator with seed "quant-terminal-2026"
│             │ ───────► calculations.ts (PnL, Sharpe, drawdown)
└─────────────┘
```

### Live PnL flow

1. `usePortfolio()` returns the simulated positions and seed-generated trades.
2. `useTickers([symbols])` returns live quotes (REST initial fetch + WS overlay
   for crypto).
3. `positionPnL(pos, livePrice)` computes mark-to-market PnL on every render.
4. `dayPnL` reverses the 24h % change to back out yesterday's price and computes
   the day's contribution per position.

### Portfolio generator

`lib/portfolio/generator.ts` produces a deterministic portfolio:

- 60–80 closed trades over the last 6 months
- 4–6 currently open positions
- ~58% win rate, realistic position sizing (~1–3% risk per trade)
- Stocks/forex entries snap to weekdays
- Initial capital: **$100,000**
- Seed: `quant-terminal-2026` (change in `lib/portfolio/generator.ts` for variation)

Entry/exit prices are random within plausible ranges per asset. To reconcile
with real historical prices, hit `/api/historical-price` per trade — the
infrastructure is in place but not auto-invoked, since hammering Yahoo for ~150
historical lookups on every cold render is wasteful for a local demo.

## Hard rules followed

1. **No hardcoded prices** — every displayed price comes from a live API.
2. **WebSocket-first for crypto** — REST is only used for the initial snapshot,
   then a single WS connection multiplexes all crypto symbols.
3. **Failed lookups display "—"** rather than a fictional value.
4. **Strict TypeScript**, error boundaries via React Query, skeleton loaders
   everywhere.

## Project layout

```
app/
  api/                  → REST proxies (Binance, Yahoo, Frankfurter, news)
  dashboard/page.tsx    → main grid
  positions/page.tsx
  history/page.tsx
  layout.tsx            → fonts + Providers + TopNav
  providers.tsx         → React Query
components/
  charts/               → CandlestickChart, EquityCurve, Sparkline
  panels/               → Header, Watchlist, Positions, OrderBook, NewsFeed,
                          ChartPanel, StatsPanel, TradeHistory
  ui/                   → Panel, Tooltip, Skeleton
  PriceCell.tsx         → number with flash-on-change animation
  SourceTooltip.tsx     → "Source: Binance, updated 2s ago"
  TopNav.tsx
lib/
  api/                  → binance.ts, yahoo.ts, frankfurter.ts, news.ts
  websocket/binance-ws.ts
  portfolio/            → store.ts (Zustand), generator.ts (seeded), calculations.ts
  hooks/                → use-tickers, use-historical, use-order-book, use-news, use-clock
  utils/                → format.ts, market-hours.ts, cn.ts
  assets.ts             → static asset registry (10 default tickers)
  types.ts
```

## Deploy to Vercel

```bash
vercel deploy           # preview
vercel --prod           # production
```

No env vars needed.
