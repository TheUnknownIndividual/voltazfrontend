import React, { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';

type Theme = {
  primary: string;
  accent: string;
  dark: string;
  surface: string;
  text: string;
};

const DEFAULT_THEME: Theme = {
  primary: '#99c21c',
  accent: '#a0ae5e',
  dark: '#172b27',
  surface: '#f7faf9',
  text: '#334155',
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map(value => Math.round(value).toString(16).padStart(2, '0')).join('')}`;

const hexToRgb = (hex: string) => {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
};

const luminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map(value => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

const colorDistance = (first: string, second: string) => {
  const a = hexToRgb(first);
  const b = hexToRgb(second);
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
};

const saturation = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const high = Math.max(r, g, b);
  const low = Math.min(r, g, b);
  return high === 0 ? 0 : (high - low) / high;
};

const extractPalette = (image: HTMLImageElement): string[] => {
  const canvas = document.createElement('canvas');
  const maxSide = 180;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return [];

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();

  for (let index = 0; index < pixels.length; index += 4) {
    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    const alpha = pixels[index + 3];
    if (alpha < 80 || (r > 242 && g > 242 && b > 242)) continue;

    const key = `${Math.round(r / 24)}-${Math.round(g / 24)}-${Math.round(b / 24)}`;
    const bucket = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };
    bucket.count += 1;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);
  }

  const candidates = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .map(bucket => rgbToHex(bucket.r / bucket.count, bucket.g / bucket.count, bucket.b / bucket.count));

  return candidates.reduce<string[]>((palette, color) => {
    if (palette.length < 8 && !palette.some(existing => colorDistance(existing, color) < 38)) palette.push(color);
    return palette;
  }, []);
};

const deriveTheme = (palette: string[]): Theme => {
  if (!palette.length) return DEFAULT_THEME;
  const vivid = [...palette].sort((a, b) => saturation(b) - saturation(a));
  const dark = [...palette].sort((a, b) => luminance(a) - luminance(b));
  const primary = vivid.find(color => luminance(color) > 0.08 && luminance(color) < 0.62) || palette[0];
  const accent = vivid.find(color => colorDistance(color, primary) > 55) || vivid[0] || primary;
  const darkest = dark[0] || primary;
  return {
    primary,
    accent,
    dark: luminance(darkest) < 0.24 ? darkest : '#172b27',
    surface: '#f7faf9',
    text: '#334155',
  };
};

const themeRoles: { key: keyof Theme; label: string; hint: string }[] = [
  { key: 'primary', label: 'Primary', hint: 'Buttons, borders & links' },
  { key: 'accent', label: 'Accent', hint: 'Highlights & live states' },
  { key: 'dark', label: 'Dark', hint: 'Strong contrast areas' },
  { key: 'surface', label: 'Surface', hint: 'Soft page backgrounds' },
  { key: 'text', label: 'Text', hint: 'Body copy & navigation' },
];

const HeaderPreview = ({ logo, theme }: { logo: string; theme: Theme }) => (
  <div className="theme-preview-header" style={{ '--lab-primary': theme.primary, '--lab-accent': theme.accent, '--lab-dark': theme.dark, '--lab-surface': theme.surface, '--lab-text': theme.text } as React.CSSProperties}>
    <div className="theme-preview-top">
      <div className="theme-preview-logo-wrap">
        <img src={logo} alt="Uploaded logo preview" />
      </div>
      <div className="theme-preview-content">
        <div className="theme-preview-main">
          <div className="theme-preview-search">
            <span>Axtarış...</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
          </div>
          <div className="theme-preview-eco">
            <i />
            <span>EKO-TÖHFƏ SAYĞACI<br/><b>450.125</b> TON CO₂</span>
          </div>
          <button className="theme-outline-button">HESABLA</button>
          <button className="theme-solid-button">ƏLAQƏ</button>
          <span className="theme-preview-login">↪ GİRİŞ</span>
          <span className="theme-preview-language">AZ⌄</span>
        </div>
      </div>
    </div>
    <nav className="theme-preview-nav">
      {['ANA SƏHİFƏ', 'HAQQIMIZDA', 'XİDMƏTLƏR', 'VOLT⌄', 'MƏHSULLAR⌄', 'FAYDALI MƏLUMAT⌄', 'TƏRƏFDAŞLIQ'].map((item, index) =>
        <span key={item} className={index === 3 ? 'active' : ''}>{item}</span>
      )}
    </nav>
  </div>
);

const SitePreview = ({ logo }: { logo: string }) => (
  <div className="theme-site-preview">
    <div className="theme-preview-heading">
      <div className="theme-lab-step"><b>05</b><span>SITE-WIDE PREVIEW</span></div>
      <span>Products · solar section · footer</span>
    </div>

    <div className="theme-site-preview-grid">
      <section className="theme-products-preview">
        <div className="theme-products-title"><div><small>SHOP</small><h3>Məhsullarımız</h3></div><i /></div>
        <div className="theme-product-card-preview">
          <div className="theme-product-image"><span>450W</span><div className="theme-panel-art" /></div>
          <small>GÜNƏŞ PANELİ</small>
          <strong>Premium solar module</strong>
          <button>SİFARİŞ ET</button>
          <button>SƏBƏTƏ ƏLAVƏ ET</button>
        </div>
      </section>

      <section className="theme-solar-preview">
        <img src="/solar-energy-field.webp" alt="Solar section preview" />
        <div className="theme-solar-preview-shade" />
        <div className="theme-solar-preview-copy"><small>SADƏ DİLDƏ GÜNƏŞ ENERJİSİ</small><h3>Öz enerjinizi istifadə edin.</h3><p>Panellər enerjini yaradır, eviniz isə onu ilk istifadə edir.</p></div>
        <div className="theme-benefit-preview"><b>Bu sizin üçün nə deməkdir?</b><span>✓ Daha az elektrik xərci</span><span>✓ Aydın enerji nəzarəti</span></div>
      </section>
    </div>

    <footer className="theme-footer-preview">
      <img src={logo} alt="Footer logo preview" />
      <div><b>VOLT.AZ</b><span>Renewable energy solutions</span></div>
      <nav><span>HOME</span><span>SERVICES</span><span>PRODUCTS</span></nav>
      <i title="Scrollbar colour preview" />
    </footer>
  </div>
);

const ThemeLab: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const homepagePreviewRef = useRef<HTMLIFrameElement>(null);
  const readSavedTheme = (): Theme | null => {
    try { return JSON.parse(localStorage.getItem('volt-theme-lab-saved') || 'null'); }
    catch { return null; }
  };
  const initialSavedTheme = useRef<Theme | null>(readSavedTheme());
  const [logo, setLogo] = useState('/volt-logo.png');
  const [fileName, setFileName] = useState('Current Volt logo');
  const [palette, setPalette] = useState<string[]>(['#99c21c', '#a0ae5e', '#172b27', '#334155']);
  const [theme, setTheme] = useState<Theme>(initialSavedTheme.current || DEFAULT_THEME);
  const [savedTheme, setSavedTheme] = useState<Theme | null>(initialSavedTheme.current);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const isThemeSaved = savedTheme !== null;
  const hasUnsavedChanges = isThemeSaved && JSON.stringify(savedTheme) !== JSON.stringify(theme);

  const syncHomepagePreview = () => {
    const previewDocument = homepagePreviewRef.current?.contentDocument;
    if (previewDocument) themeRoles.forEach(role => previewDocument.documentElement.style.setProperty(`--color-${role.key}`, theme[role.key]));
    homepagePreviewRef.current?.contentWindow?.postMessage({ type: 'volt-theme-preview', theme, logo }, window.location.origin);
  };

  useEffect(() => {
    themeRoles.forEach(role => document.documentElement.style.setProperty(`--color-${role.key}`, theme[role.key]));
    syncHomepagePreview();
  }, [theme, logo]);

  const cssVariables = useMemo(() => `:root {\n${themeRoles.map(role => `  --color-${role.key}: ${theme[role.key]};`).join('\n')}\n}`, [theme]);

  const processFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = event => {
      const source = String(event.target?.result || '');
      const image = new Image();
      image.onload = () => {
        const colors = extractPalette(image);
        setLogo(source);
        setFileName(file.name);
        setPalette(colors);
        if (!isThemeSaved) setTheme(deriveTheme(colors));
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  };

  const onUpload = (event: ChangeEvent<HTMLInputElement>) => processFile(event.target.files?.[0]);
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    processFile(event.dataTransfer.files?.[0]);
  };

  const setRole = (key: keyof Theme, color: string) => setTheme(current => ({ ...current, [key]: color }));
  const saveTheme = () => {
    localStorage.setItem('volt-theme-lab-saved', JSON.stringify(theme));
    setSavedTheme({ ...theme });
  };
  const clearTheme = () => {
    localStorage.removeItem('volt-theme-lab-saved');
    localStorage.removeItem('volt-theme-lab');
    setSavedTheme(null);
    setTheme(DEFAULT_THEME);
  };
  const copyCss = async () => {
    let didCopy = false;
    try {
      await navigator.clipboard.writeText(cssVariables);
      didCopy = true;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = cssVariables;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      didCopy = document.execCommand('copy');
      textarea.remove();
    }
    if (didCopy) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="theme-lab" style={{ '--lab-primary': theme.primary, '--lab-accent': theme.accent, '--lab-dark': theme.dark, '--lab-surface': theme.surface, '--lab-text': theme.text } as React.CSSProperties}>
      <div className="theme-lab-shell">
        <header className="theme-lab-titlebar">
          <div>
            <div className="theme-lab-kicker"><span /> VOLT / TEMPORARY TOOL</div>
            <h1>Logo & colour lab</h1>
            <p>Upload a brand mark, inspect its real colours, then tune how they behave across the site.</p>
          </div>
          <a href="/" className="theme-lab-back">← Back to website</a>
        </header>

        <section className="theme-lab-workspace">
          <div className="theme-lab-sidebar">
            <div className="theme-lab-panel">
              <div className="theme-lab-step"><b>01</b><span>LOGO SOURCE</span></div>
              <div
                className={`theme-upload-zone ${dragging ? 'dragging' : ''}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={event => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onUpload} hidden />
                <div className="theme-upload-icon">↑</div>
                <strong>Drop a logo here</strong>
                <span>or click to choose PNG, JPG, WebP or SVG</span>
              </div>
              <div className="theme-file-row"><img src={logo} alt="Logo thumbnail"/><span><b>{fileName}</b><small>Shown live in the header</small></span></div>
            </div>

            <div className="theme-lab-panel">
              <div className="theme-lab-step"><b>02</b><span>EXTRACTED COLOURS</span></div>
              <p className="theme-panel-copy">White and transparent pixels are ignored automatically.</p>
              {palette.length ? <div className="theme-palette">
                {palette.map(color => <button key={color} title={`Use ${color} as primary`} onClick={() => setRole('primary', color)}>
                  <i style={{ background: color }} /><span>{color.toUpperCase()}</span>
                </button>)}
              </div> : <div className="theme-empty-palette">No non-white colours found in this image.</div>}
            </div>
          </div>

          <div className="theme-lab-main">
            <div className="theme-lab-panel theme-role-panel">
              <div className="theme-role-heading">
                <div>
                  <div className="theme-lab-step"><b>03</b><span>ASSIGN THE REST</span></div>
                  <p>{isThemeSaved ? 'Theme locked — new logos will not replace these colours.' : 'Auto-picked from the logo. Adjust any role below.'}</p>
                </div>
                <div className="theme-role-actions">
                  <button className="theme-save-button" onClick={saveTheme} disabled={isThemeSaved && !hasUnsavedChanges}>
                    {isThemeSaved && !hasUnsavedChanges ? '✓ Saved' : hasUnsavedChanges ? 'Save changes' : 'Save'}
                  </button>
                  <button className="theme-clear-button" onClick={clearTheme}>Clear</button>
                </div>
              </div>
              <div className="theme-role-grid">
                {themeRoles.map(role => <label key={role.key}>
                  <input type="color" value={theme[role.key]} onChange={event => setRole(role.key, event.target.value)} />
                  <span><b>{role.label}</b><small>{role.hint}</small></span>
                  <input className="theme-hex-input" value={theme[role.key].toUpperCase()} onChange={event => /^#[0-9A-Fa-f]{6}$/.test(event.target.value) && setRole(role.key, event.target.value)} />
                </label>)}
              </div>
            </div>

            <div className="theme-css-row"><code>{cssVariables}</code><button onClick={copyCss}>{copied ? 'Copied!' : 'Copy CSS'}</button></div>
          </div>
        </section>

        <section className="theme-real-preview-section">
          <div className="theme-real-preview-heading">
            <div>
              <div className="theme-lab-step"><b>04</b><span>REAL HOMEPAGE PREVIEW</span></div>
              <p>This is the live homepage—not a mockup. Scroll inside it to inspect every section.</p>
            </div>
            <div className="theme-preview-modes">
              <button className={previewMode === 'desktop' ? 'active' : ''} onClick={() => setPreviewMode('desktop')}>Desktop</button>
              <button className={previewMode === 'mobile' ? 'active' : ''} onClick={() => setPreviewMode('mobile')}>Mobile</button>
            </div>
          </div>
          <div className={`theme-real-preview-stage ${previewMode}`}>
            <iframe
              ref={homepagePreviewRef}
              src="/"
              title="Live Volt.az homepage preview"
              onLoad={syncHomepagePreview}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ThemeLab;
