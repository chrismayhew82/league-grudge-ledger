# The League Grudge Ledger

All-time stats, live matchups and trash talk for the league, as a web app you can install on any phone.

- **Website:** `https://chrismayhew82.github.io/league-grudge-ledger/` (once GitHub Pages is switched on)
- **Install on a phone:** open the link, then
  - iPhone (Safari): Share → **Add to Home Screen**
  - Android (Chrome): ⋮ menu → **Install app** / **Add to Home screen**

## How the data updates
`data/league.json` holds every season. The **ESPN sync** workflow (`.github/workflows/espn-sync.yml`) pulls scores from ESPN on game days (Brisbane time):

| When | What |
|---|---|
| Mon 12am–4pm, hourly | Sunday games |
| Tue 10am–4pm, hourly | Monday night game |
| Fri 10am–4pm, hourly | Thursday night game |
| Wed 6:49am + 12:49pm | Locks in the finished week |

Run it any time from **Actions → ESPN sync → Run workflow**.

## Setup (one-off)
1. **Secrets:** Settings → Secrets and variables → Actions → New repository secret
   - `ESPN_S2` = the `espn_s2` cookie value from fantasy.espn.com
   - `ESPN_SWID` = the `SWID` cookie value (including the `{ }` braces)
2. **Pages:** Settings → Pages → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)` → Save.

If the ESPN cookies expire, the sync fails and GitHub emails you; update the two secrets.
