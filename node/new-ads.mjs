// Every Google ad a competitor started in the last N days: reads Google's
// Ads Transparency Center for a website, prints the new ads by format and
// by the day they were first shown, and writes them to ads.csv.
//
//   APIFY_TOKEN=... node new-ads.mjs casper.com 30
import { writeFileSync } from 'node:fs';
import { ApifyClient } from 'apify-client';

const [site, days = '30'] = process.argv.slice(2);
if (!site) throw new Error('Give a website, and optionally how many days back');

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });
const run = await client.actor('simple.actor/google-ads-transparency').call({
    targets: [site],
    firstShownSince: `${days} days`,
    maxAds: 2000, // how far down the list new ads are looked for; only the ones kept are charged
});
const { items } = await client.dataset(run.defaultDatasetId).listItems();

// A line that could not be looked up is a row with type "error", never silence.
for (const e of items.filter((i) => i.type === 'error')) console.error(`${e.error}: ${e.errorDescription}`);
const ads = items.filter((i) => i.type === 'ad');
if (ads.length) console.log(`Google holds ${ads[0].googleAdCountMin}-${ads[0].googleAdCountMax} ads for ${site}`);
console.log(`${ads.length} first shown in the last ${days} days`);

const tally = (key) => {
    const c = {};
    for (const a of ads) c[key(a)] = (c[key(a)] || 0) + 1;
    return Object.entries(c).sort();
};
for (const [f, n] of tally((a) => a.format)) console.log(`  ${f.padEnd(6)} ${n}`);
console.log('first shown, by day:');
for (const [d, n] of tally((a) => a.firstShown.slice(0, 10))) console.log(`  ${d} ${n}`);
console.log(`advertisers: ${new Set(ads.map((a) => a.advertiserId)).size}`);

const cols = ['firstShown', 'lastShown', 'daysShown', 'format', 'advertiserName', 'imageUrl', 'previewUrl', 'adUrl'];
const cell = (x) => (x == null ? '' : `"${String(x).replace(/"/g, '""')}"`);
writeFileSync('ads.csv', [cols.join(','), ...ads.map((a) => cols.map((c) => cell(a[c])).join(','))].join('\n') + '\n');
console.log('wrote ads.csv');
