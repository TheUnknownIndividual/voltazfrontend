import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = process.env.BUILD_DIR
  ? path.resolve(process.env.BUILD_DIR)
  : path.join(root, 'dist');
const webConfigPath = path.join(dist, 'web.config');

const replaceRule = (source, ruleName, replacement) => {
  const startMarker = `        <rule name="${ruleName}"`;
  const start = source.indexOf(startMarker);
  if (start === -1) {
    throw new Error(`Could not find the "${ruleName}" rule in ${webConfigPath}.`);
  }

  const endMarker = '        </rule>';
  const end = source.indexOf(endMarker, start);
  if (end === -1) {
    throw new Error(`Could not find the end of the "${ruleName}" rule in ${webConfigPath}.`);
  }

  return `${source.slice(0, start)}${replacement}${source.slice(end + endMarker.length)}`;
};

let webConfig = await fs.readFile(webConfigPath, 'utf8');

webConfig = replaceRule(webConfig, 'Prerendered extensionless HTML', '');
webConfig = replaceRule(
  webConfig,
  'Authenticated and live dynamic SPA routes',
  `        <rule name="SPA fallback" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>`,
);

if (webConfig.includes('__PRERENDER_DIR__')) {
  throw new Error(`Prerender placeholder remains in ${webConfigPath}.`);
}

await fs.writeFile(webConfigPath, webConfig, 'utf8');
console.log('Prepared SPA-only IIS routing (prerender disabled).');
