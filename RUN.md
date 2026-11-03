# Runs behind the example

All on 2026-11-03 (UTC), google-ads-transparency build 0.1.9 (latest), from the
account `simple.actor` (the owner's), so nothing was billed. The caller price
uses the listing's $0.0005 per `ad` and $0.0005 per `ad-details`, read the same
day; there is no start fee.

| Run | Input | Result | Time | Platform usage | Caller price |
|---|---|---|---|---|---|
| `7hSshF8cjfmPwA56b` | eight websites, `maxAds` 1 (a probe for Google's counts) | 8 ads | 13s | $0.0003 | $0.004 |
| `aJnQgnHUAf9Xmaosf` | casper.com, purple.com, saatva.com, `maxAds` 2000, `shownSince` 30 days | 695 ads | 15s | $0.0038 | $0.3475 |
| `RWD2Bj0hohI7cZsOO` | same sites, `maxAds` 2000, `firstShownSince` 30 days, `includeAdDetails` | 136 ads, 136 with details | 113s | $0.0027 | $0.136 |
| `MH1eO7dH2MYQcZCu7` | `node/new-ads.mjs casper.com 14` | 17 ads | 20s | $0.0003 | $0.0085 |
| `sjlbK9UwO3jGj1J6b` | `python/new_ads.py saatva.com 7` | 12 ads | 9s | $0.0001 | $0.006 |


