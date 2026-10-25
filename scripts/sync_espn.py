#!/usr/bin/env python3
"""Pull the latest results and live matchups from the ESPN league into data/league.json.

Needs two GitHub secrets (your ESPN login cookies): ESPN_S2 and ESPN_SWID.
Prints a one-line summary and sets `changed=true|false` for the workflow.
"""
import datetime, json, os, sys, urllib.request, urllib.error

LEAGUE_ID = 1695226813
DATA = os.path.join(os.path.dirname(__file__), '..', 'data', 'league.json')
# ESPN team id -> manager name used on the page
TM = {1: 'Mayhew', 2: 'Joe', 3: 'Proud', 4: 'Andrew', 5: 'Doug', 6: 'TimO', 7: 'Kingy', 8: 'Mr Coin'}


def get(url, cookies):
    req = urllib.request.Request(url, headers={
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (league-grudge-ledger sync)',
        'Accept': 'application/json',
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def core(s):
    s = json.loads(json.dumps(s)); s.pop('updated', None)
    if s.get('live'): s['live'].pop('updated', None)
    return json.dumps(s, sort_keys=True)


def main():
    s2, swid = os.environ.get('ESPN_S2', '').strip(), os.environ.get('ESPN_SWID', '').strip()
    if not s2 or not swid:
        sys.exit('ESPN_S2 / ESPN_SWID secrets are missing. Add them under Settings > Secrets and variables > Actions.')
    cookies = f'espn_s2={s2}; SWID={swid}'
    S = json.load(open(DATA))
    year = S['current']['year']
    base = f'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/{year}/segments/0/leagues/{LEAGUE_ID}'
    try:
        st = get(base + '?view=mSettings&view=mTeam', cookies)
        cur, sp = st['status']['currentMatchupPeriod'], st['scoringPeriodId']
        reg = st['settings']['scheduleSettings']['matchupPeriodCount']
        sb = get(base + f'?view=mMatchupScore&view=mScoreboard&scoringPeriodId={sp}', cookies)
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            sys.exit(f'ESPN refused the request ({e.code}). The ESPN cookies have probably expired: update the ESPN_S2 and ESPN_SWID secrets.')
        raise
    names = {t['id']: t.get('name') or '' for t in st['teams']}
    before = core(S)
    games = S['current']['games']
    idx = {(g['wk'], frozenset((g['a'], g['b']))): g for g in games}
    added = []
    live = []
    for m in sb['schedule']:
        if not m.get('away'): continue  # byes
        wk, h, a = m['matchupPeriodId'], m['home']['teamId'], m['away']['teamId']
        if h not in TM or a not in TM: continue
        A, B = TM[h], TM[a]
        hp, ap = m['home'].get('totalPoints', 0), m['away'].get('totalPoints', 0)
        if m.get('winner') not in ('UNDECIDED', None) and wk <= reg and wk >= cur - 3 and hp != ap:
            key = (wk, frozenset((A, B))); g = idx.get(key)
            if g is None:
                g = {'id': f'espn{wk}_{h}_{a}', 'wk': wk, 'a': A, 'as': round(hp, 2), 'b': B, 'bs': round(ap, 2)}
                games.append(g); idx[key] = g; added.append(f'W{wk} {A} {hp} - {ap} {B}')
            else:
                sc = {A: round(hp, 2), B: round(ap, 2)}; g['as'], g['bs'] = sc[g['a']], sc[g['b']]
        if wk == cur:
            H, W = m['home'], m['away']
            live.append({'a': A, 'an': names.get(h, ''), 'as': round(H.get('totalPointsLive', hp) or 0, 2),
                         'ap': H.get('winProbability'), 'aj': round(H.get('totalProjectedPointsLive') or 0),
                         'b': B, 'bn': names.get(a, ''), 'bs': round(W.get('totalPointsLive', ap) or 0, 2),
                         'bp': W.get('winProbability'), 'bj': round(W.get('totalProjectedPointsLive') or 0),
                         'final': m.get('winner') not in ('UNDECIDED', None)})
    games.sort(key=lambda g: (g['wk'], g['id']))
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=10)))
    S['live'] = {'week': cur, 'playoffs': cur > reg, 'updated': now.isoformat(timespec='minutes'), 'matchups': live}
    changed = core(S) != before
    if changed:
        S['updated'] = now.strftime('%-d %b %Y')
        with open(DATA, 'w') as f: json.dump(S, f, indent=1); f.write('\n')
    msg = ('New results: ' + '; '.join(added)) if added else ('Live cards updated' if changed else 'No change')
    print(msg)
    out = os.environ.get('GITHUB_OUTPUT')
    if out:
        with open(out, 'a') as f: f.write(f'changed={"true" if changed else "false"}\nsummary={msg}\n')


if __name__ == '__main__':
    main()
