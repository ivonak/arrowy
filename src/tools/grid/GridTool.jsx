import { useState, useRef, useCallback, useEffect } from 'react';
import useGridRenderer from './useGridRenderer';
import GridPanel from './GridPanel';
import { CodeModal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { usePanelCollapsed, PANEL_WIDTH } from '../../components/Panel';
import { generateReadableJS, generateMinifiedJS } from './codegen';

const STORAGE_KEY = 'grid_playground_settings_v1';
const PRESETS_KEY = 'grid_playground_presets_v1';

const DEFAULTS = {
  bgStart: '#1a1a2e',
  bgMid: '#16213e',
  bgEnd: '#0f3460',
  dotColor: '#ffffff',
  dotOpacity: 0.06,
  dotFinalOpacity: 0.55,
  gridSpacing: 24,
  dotSize: 1,
  influenceRadius: 180,
  shapeType: 'circle',
  shapeStretchX: 1,
  shapeStretchY: 1,
  blobSeed: 127,
  blobLobes: 6,
  blobJaggedness: 0.25,
  blobScale: 1,
  ballRoundness: 0.7,
  compressionStrength: 0.62,
  dotSeparation: 1.05,
  dotSharpness: 1.3,
  grainEnabled: true,
  grainAmount: 0.35,
  grainBackColor: '#6f7fa8',
  grainFrontColor: '#ffffff',
  grainBackOpacity: 1.0,
  grainFrontOpacity: 1.0,
  grainBgMode: 'dark',
  grainBlendMode: 'normal',
  grainSpread: 0.35,
  grainContrast: 1.1,
  grainPresence: 1.0,
  grainCoverage: 1.0,
  grainBreakup: 0.65,
  grainThreshold: 1.0,
  grainLift: 0.45,
  grainGamma: 1.15,
  grainDither: 0.9,
  grainBias: 0.35,
  grainOffset: 0.35,
  grainEdgeSoftness: 0.65,
  grainIntensity: 0.15,
  grainRadialFalloff: 2.0,
  grainEdgeSteepness: 1.0,
  grainDensityScale: 1.0,
  grainFalloffOnset: 1.0,
  motionSpeed: 0.55,
  waveAmount: 0.14,
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

export default function GridTool() {
  const [config, setConfig] = useState(() => loadConfig());
  const [presets, setPresets] = useState(() => loadPresets());
  const [activePresetId, setActivePresetId] = useState(null);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [panelCollapsed, togglePanel] = usePanelCollapsed();
  const canvasRef = useRef(null);
  const configRef = useRef(config);
  const toast = useToast();

  configRef.current = config;

  useGridRenderer(canvasRef, configRef);

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
    const fresh = { ...DEFAULTS, blobSeed: DEFAULTS.blobSeed };
    setConfig(fresh);
    saveConfig(fresh);
    toast?.('Reset to defaults');
  }, [toast]);

  const handleRegenBlob = useCallback(() => {
    const next = { ...configRef.current, blobSeed: Math.floor(Math.random() * 10000) };
    setConfig(next);
    saveConfig(next);
    toast?.('Regenerated blob shape');
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

  const bgStyle = {
    background: `linear-gradient(135deg, ${config.bgStart} 0%, ${config.bgMid} 50%, ${config.bgEnd} 100%)`,
  };

  const panelOffset = panelCollapsed ? 0 : PANEL_WIDTH;

  return (
    <div className="h-full w-full" style={bgStyle}>
      <div className="fixed inset-0 transition-[right] duration-300" style={{ right: panelOffset }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      </div>
      <GridPanel
        config={config}
        onChange={handleChange}
        onReset={handleReset}
        onRegenBlob={handleRegenBlob}
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
      />
    </div>
  );
}

export { DEFAULTS };
