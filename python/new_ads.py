"""Every Google ad a competitor started in the last N days: reads Google's
Ads Transparency Center for a website, prints the new ads by format and by
the day they were first shown, and writes them to ads.csv.

    APIFY_TOKEN=... python new_ads.py casper.com 30
"""
import csv
import os
import sys
from collections import Counter

from apify_client import ApifyClient

if len(sys.argv) < 2:
    sys.exit("Give a website, and optionally how many days back")
site = sys.argv[1]
days = int(sys.argv[2]) if len(sys.argv) > 2 else 30

client = ApifyClient(os.environ["APIFY_TOKEN"])
run = client.actor("simple.actor/google-ads-transparency").call(run_input={
    "targets": [site],
    "firstShownSince": f"{days} days",
    "maxAds": 2000,  # how far down the list new ads are looked for; only the ones kept are charged
})
items = list(client.dataset(run.default_dataset_id).iterate_items())

# A line that could not be looked up is a row with type "error", never silence.
for e in (i for i in items if i["type"] == "error"):
    print(f"{e['error']}: {e['errorDescription']}", file=sys.stderr)
ads = [i for i in items if i["type"] == "ad"]
if ads:
    print(f"Google holds {ads[0]['googleAdCountMin']}-{ads[0]['googleAdCountMax']} ads for {site}")
print(f"{len(ads)} first shown in the last {days} days")
for f, n in sorted(Counter(a["format"] for a in ads).items()):
    print(f"  {f:6} {n}")
print("first shown, by day:")
for d, n in sorted(Counter(a["firstShown"][:10] for a in ads).items()):
    print(f"  {d} {n}")
print(f"advertisers: {len({a['advertiserId'] for a in ads})}")

cols = ["firstShown", "lastShown", "daysShown", "format", "advertiserName", "imageUrl", "previewUrl", "adUrl"]
with open("ads.csv", "w", newline="") as f:
    w = csv.writer(f, quoting=csv.QUOTE_NONNUMERIC)
    w.writerow(cols)
    for a in ads:
        w.writerow(["" if a.get(c) is None else a[c] for c in cols])
print("wrote ads.csv")
