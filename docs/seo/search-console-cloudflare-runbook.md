# Search Console and Cloudflare rollout

These are manual, reversible console actions. Website deployment and Cloudflare policy changes remain user-controlled.

## Search Console

After the tested build is deployed, open URL Inspection for each URL, confirm the declared canonical is itself, run **Test live URL**, and request indexing:

- `https://volt.az/gunes-panelleri`
- `https://volt.az/gunes-invertorlari`
- `https://volt.az/gunes-paneli-qurasdirilmasi`
- `https://volt.az/ru/solnechnye-paneli`
- `https://volt.az/ru/solnechnye-invertory`
- `https://volt.az/ru/ustanovka-solnechnyh-paneley`

Submit `https://volt.az/sitemap.xml` once. Repeated submission does not accelerate crawling. The Search Console API used by the local connector cannot request ordinary web-page indexing.

For legacy URLs, export Page indexing and Search Console landing-page data. Map a URL to a 301 only when a genuinely equivalent current page exists. Keep malicious/compromised namespaces at 410 and keep unrelated missing URLs at 404. Do not redirect every missing URL to the homepage.

## Cloudflare AI Crawl Control

In **Security / AI Crawl Control**:

- allow verified **Search** crawlers;
- allow verified user-driven **AI Agent** crawlers;
- block **AI Training** crawlers;
- preserve 200 responses for canonical public pages, `/sitemap.xml`, `/robots.txt`, and `/llms.txt`.

Use Cloudflare's verified-bot classification. Do not allow a request merely because its User-Agent says GPTBot, ClaudeBot, or another known name.

## Targeted scanner protection

Create a narrowly scoped custom WAF rule in log mode first. Protect secret and compromised paths such as `/.env`, `/.git/`, private keys, backup archives, and known malicious namespaces. Exclude `cf.client.bot` so Cloudflare-verified crawlers are not affected. Review Security Events before changing the action to block. Avoid broad path or User-Agent rules that can catch legitimate pages.

`cf.client.bot` is the broadly available verified-bot field; `cf.bot_management.verified_bot` requires Bot Management on Enterprise. Cloudflare documents them as equivalent where both are available.

## Weekly evidence

Run both local reports:

```bash
cd "/Users/user/Desktop/voltdev/seo-analytics"
./run.sh --days 28 --json
./run.sh --days 90 --json
```

For the optional crawler section, supply a read-only Cloudflare analytics token only in the command environment. Review verified AI requests, canonical paths, 2xx/3xx/4xx distribution, GA4 AI referrals, and genuine lead events. Never store the token in the repository or output files.
