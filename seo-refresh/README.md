# Volt daily SEO refresh

Copy this folder to `C:\Services\volt-seo-refresh` on the production IIS server. It uses Node 20+ and only public API reads.

Before installing the scheduled task, confirm the physical production IIS web root. Run a dry run:

```powershell
$env:SEO_API_BASE_URL = 'https://api.volt.az/api/'
$env:SEO_EXPECTED_PRODUCT_COUNT = '346'
$env:SEO_DRY_RUN = 'true'
& 'C:\Program Files\nodejs\node.exe' 'C:\Services\volt-seo-refresh\refresh.mjs'
```

Then run `install-seo-refresh-task.ps1` as an administrator with the service directory and confirmed production web root. The task does not use FTP and must run under a dedicated account that can modify only `sitemap.xml`, `llms.txt`, and `robots.txt` in that root.

The production IIS configuration currently rewrites `sitemap.xml` and `robots.txt` dynamically through the API. The generated files are safe fallbacks, while `llms.txt` is served directly and is the primary daily-refresh output.
