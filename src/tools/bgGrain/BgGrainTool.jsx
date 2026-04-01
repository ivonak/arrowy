import { useState, useRef, useCallback } from 'react';
import useGrainRenderer from './useGrainRenderer';
import BgGrainPanel from './BgGrainPanel';
import { CodeModal } from '../../components/organisms/Modal';
import { useToast } from '../../components/organisms/Toast';
import { usePanelCollapsed, PANEL_WIDTH } from '../../components/organisms/Panel';
import { generateReadableJS, generateMinifiedJS } from './codegen';

const STORAGE_KEY = 'bg_grain_settings_v1';
const PRESETS_KEY = 'bg_grain_presets_v1';

const DEFAULTS = {
  gradientMode: 'css',
  bgColor: '#ffffff',

  bgColor1: '#b4c8e0',
  bgColor2: '#ece4e0',
  bgColor3: '#d5c8d5',
  gradientAngle: 150,
  gradientMidpoint: 0.48,
  gradientType: 'linear',
  gradientSaturation: 1,
  gradientContrast: 1,
  gradientBrightness: 1,
  gradientSoftness: 1,
  gradientWarmth: 1,

  shaderPoints: [
    { x: 0.12, y: 0.28, color: '#6BA3CC', width: 0.70, height: 0.32, angle: -15, intensity: 0.72 },
    { x: 0.06, y: 0.82, color: '#7EC0F6', width: 0.25, height: 0.12, angle: -40, intensity: 0.40 },
    { x: 0.58, y: 0.48, color: '#D4937A', width: 0.38, height: 0.28, angle: -10, intensity: 0.45 },
    { x: 0.72, y: 0.62, color: '#C8B0D0', width: 0.42, height: 0.30, angle: 5, intensity: 0.25 },
    { x: 0.28, y: 0.48, color: '#F5EDE8', width: 0.48, height: 0.38, angle: 0, intensity: 0.55 },
  ],
  shaderNoiseScale: 2.0,
  shaderNoiseAmount: 0.04,
  shaderWarpScale: 2.5,
  shaderWarpAmount: 0.12,
  shaderWarpScale2: 4.0,
  shaderWarpAmount2: 0.06,
  shaderWarpSpeed: 0.15,

  grainAmount: 0,
  grainScale: 1.5,
  grainSpeed: 0.8,
  grainBlendMode: 'overlay',

  grainContrast: 1.2,
  grainBrightness: 0,
  grainSoftness: 0.15,
  grainDensity: 0.7,
};

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveConfig(cfg) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch {}
}

function loadPresets() {
  try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || '[]'); } catch { return []; }
}

function savePresets(items) {
  try { localStorage.setItem(PRESETS_KEY, JSON.stringify(items)); } catch {}
}

function buildBgGrainDemoHtml(config) {
  const code = generateReadableJS(config);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>BG Grain \u2013 Demo</title>
  <style>* { margin: 0; padding: 0; box-sizing: border-box; } html { height: 100%; background: ${config.bgColor || '#ffffff'}; } body { height: 100%; }</style>
</head>
<body>
  <div id="bg"></div>
  <script type="module">
${code}
createGrainBackground(document.getElementById('bg'));
  </script>
</body>
</html>`;
}

export default function BgGrainTool() {
  const [config, setConfig] = useState(() => loadConfig());
  const [presets, setPresets] = useState(() => loadPresets());
  const [activePresetId, setActivePresetId] = useState(null);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [panelCollapsed, togglePanel] = usePanelCollapsed();
  const canvasRef = useRef(null);
  const configRef = useRef(config);
  const toast = useToast();

  configRef.current = config;

  useGrainRenderer(canvasRef, configRef);

  const saveTimer = useRef(null);
  const debouncedSave = useCallback((cfg) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveConfig(cfg), 200);
  }, []);

  const handleChange = useCallback((next) => {
    setConfig(next);
    debouncedSave(next);
  }, [debouncedSave]);

  const handleReset = useCallback(() => {
    setConfig({ ...DEFAULTS });
    saveConfig({ ...DEFAULTS });
    toast?.('Reset to defaults');
  }, [toast]);

  const handlePresetSelect = useCallback((id) => {
    const p = presets.find(x => x.id === id);
    if (!p) return;
    setActivePresetId(id);
    const next = { ...DEFAULTS, ...p.config };
    setConfig(next);
    saveConfig(next);
  }, [presets]);

  const handlePresetSave = useCallback((name) => {
    const item = {
      id: `p_${Date.now()}_${Math.floor(Math.random() * 1e4)}`,
      name,
      config: { ...configRef.current },
      updatedAt: Date.now(),
    };
    const next = [...presets, item];
    setPresets(next);
    savePresets(next);
    setActivePresetId(item.id);
    toast?.(`Saved preset "${name}"`);
  }, [presets, toast]);

  const handlePresetDelete = useCallback((id) => {
    const next = presets.filter(x => x.id !== id);
    setPresets(next);
    savePresets(next);
    if (activePresetId === id) setActivePresetId(null);
    toast?.('Preset deleted');
  }, [presets, activePresetId, toast]);

  const panelOffset = panelCollapsed ? 0 : PANEL_WIDTH;
  const isCSS = config.gradientMode !== 'shader';
  const softExtra = ((config.gradientSoftness ?? 1) - 1) * 10;

  const previewStyle = {
    right: panelOffset,
    backgroundColor: config.bgColor || '#ffffff',
  };

  const cssFilterParts = [
    `saturate(${config.gradientSaturation ?? 1})`,
    `contrast(${config.gradientContrast ?? 1})`,
    `brightness(${config.gradientBrightness ?? 1})`,
  ];
  if (softExtra > 0) cssFilterParts.push(`blur(${softExtra}px)`);

  const gradientCompositeStyle = isCSS ? {
    position: 'absolute',
    inset: 0,
    filter: cssFilterParts.join(' '),
  } : undefined;

  return (
    <div className="h-full w-full">
      <div className="fixed inset-0 overflow-hidden transition-[right] duration-300" style={previewStyle}>
        {isCSS && (
          <div style={gradientCompositeStyle}>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1754 1096"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="bg_b100" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
                  <feGaussianBlur stdDeviation="100" />
                </filter>
                <filter id="bg_b90" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
                  <feGaussianBlur stdDeviation="90" />
                </filter>
                <filter id="bg_b80" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
                  <feGaussianBlur stdDeviation="80" />
                </filter>
                <filter id="bg_b30" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
                  <feGaussianBlur stdDeviation="30" />
                </filter>
                <linearGradient id="bg_g12" gradientUnits="objectBoundingBox" x1="0.06" y1="0.2" x2="0.95" y2="0.35">
                  <stop offset="0" stopColor="white" />
                  <stop offset="0.402" stopColor="#3C84AB" />
                </linearGradient>
                <linearGradient id="bg_g9" gradientUnits="objectBoundingBox" x1="0.89" y1="0.55" x2="0.09" y2="0">
                  <stop offset="0.302" stopColor="#FF8000" stopOpacity="0.82" />
                  <stop offset="1" stopColor="white" />
                </linearGradient>
                <linearGradient id="bg_g10" gradientUnits="objectBoundingBox" x1="0.5" y1="0" x2="0.5" y2="1">
                  <stop offset="0" stopColor="#BB8BC9" />
                  <stop offset="0.476" stopColor="white" />
                  <stop offset="1" stopColor="#D7A8E5" />
                </linearGradient>
                <linearGradient id="bg_g8" gradientUnits="objectBoundingBox" x1="0.5" y1="0" x2="0.5" y2="1">
                  <stop offset="0" stopColor="#902FFF" />
                  <stop offset="0.077" stopColor="white" stopOpacity="0.9" />
                  <stop offset="0.685" stopColor="white" stopOpacity="0.9" />
                  <stop offset="0.947" stopColor="#E2A8E9" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="bg_g14" gradientUnits="objectBoundingBox" x1="0.5" y1="0" x2="0.5" y2="1">
                  <stop offset="0" stopColor="white" stopOpacity="0" />
                  <stop offset="0.637" stopColor="#569AF4" />
                </linearGradient>
              </defs>
              <rect width="1754" height="1096" fill={config.bgColor || '#ffffff'} />
              <g opacity="0.5" filter="url(#bg_b100)">
                <ellipse cx="936.6" cy="618.9" rx="933.2" ry="584.1" fill="url(#bg_g12)" transform="rotate(-9.96 936.6 618.9)" />
              </g>
              <g filter="url(#bg_b100)">
                <ellipse cx="1175.5" cy="610.1" rx="561.2" ry="401.4" fill="white" transform="rotate(-25.02 1175.5 610.1)" />
              </g>
              <g opacity="0.4" filter="url(#bg_b100)">
                <ellipse cx="861.5" cy="666.4" rx="954.1" ry="532.6" fill="#F1E8ED" transform="rotate(-16.73 861.5 666.4)" />
              </g>
              <g opacity="0.6" filter="url(#bg_b100)">
                <ellipse cx="741.3" cy="672.5" rx="742.8" ry="395.2" fill="url(#bg_g9)" transform="rotate(-16.73 741.3 672.5)" />
              </g>
              <g opacity="0.5" filter="url(#bg_b100)">
                <ellipse cx="797.9" cy="716.2" rx="938.5" ry="555.5" fill="url(#bg_g10)" transform="rotate(-16.73 797.9 716.2)" />
              </g>
              <g opacity="0.8" filter="url(#bg_b80)">
                <ellipse cx="529.5" cy="616.5" rx="561.2" ry="359.4" fill="url(#bg_g8)" transform="rotate(-20.41 529.5 616.5)" />
              </g>
              <g opacity="0.5" filter="url(#bg_b90)">
                <ellipse cx="139.4" cy="788.5" rx="265.2" ry="101" fill="#7EC0F6" transform="rotate(-43.96 139.4 788.5)" />
              </g>
              <g filter="url(#bg_b30)">
                <ellipse cx="1186.2" cy="1138" rx="717" ry="380" fill="url(#bg_g14)" fillOpacity="0.2" />
              </g>
              <g opacity="0.8" filter="url(#bg_b80)">
                <ellipse cx="-245.9" cy="410.3" rx="561.2" ry="342.3" fill="white" transform="rotate(159.33 -245.9 410.3)" />
              </g>
            </svg>
          </div>
        )}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      </div>
      <BgGrainPanel
        config={config}
        onChange={handleChange}
        onReset={handleReset}
        onGetCode={() => setCodeModalOpen(true)}
        presets={presets}
        activePresetId={activePresetId}
        onPresetSelect={handlePresetSelect}
        onPresetSave={handlePresetSave}
        onPresetDelete={handlePresetDelete}
        collapsed={panelCollapsed}
        onToggleCollapsed={togglePanel}
      />
      <CodeModal
        open={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        title="Generated Code"
        readableCode={generateReadableJS(config)}
        minifiedCode={() => generateMinifiedJS(config)}
        instructions={
          <ol className="list-decimal list-inside space-y-2">
            <li>Save the code below as a <code className="bg-white/8 px-1.5 py-0.5 rounded text-[12px] font-mono text-white/90">.js</code> file in your project, e.g. <code className="bg-white/8 px-1.5 py-0.5 rounded text-[12px] font-mono text-white/90">grain-bg.js</code></li>
            <li>Add this right before the closing <code className="bg-white/8 px-1.5 py-0.5 rounded text-[12px] font-mono text-white/90">{'</body>'}</code> tag in your HTML:</li>
            <pre className="bg-white/5 rounded px-3 py-2 ml-5 font-mono text-[12px] text-white/80 leading-relaxed whitespace-pre">{'<div id="bg"></div>\n\n<script type="module">\n  import { createGrainBackground } from \'./grain-bg.js\';\n  createGrainBackground(document.getElementById(\'bg\'));\n</script>'}</pre>
            <li>The effect will fill the whole page as a background.</li>
          </ol>
        }
        demoHtml={() => buildBgGrainDemoHtml(config)}
      />
    </div>
  );
}

export { DEFAULTS };
