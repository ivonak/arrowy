import { useCallback } from 'react';
import Panel from '../../components/organisms/Panel';
import Section from '../../components/organisms/Section';
import Slider from '../../components/molecules/Slider';
import ColorPicker from '../../components/molecules/ColorPicker';
import Select from '../../components/molecules/Select';
import Button from '../../components/atoms/Button';
import PresetGrid from '../../components/organisms/PresetGrid';
import PlusIcon from '../../components/atoms/icons/PlusIcon';
import ControlPointRow from './ControlPointRow';
import ModeThumbnail from './ModeThumbnail';

export default function BgGrainPanel({ config, onChange, onReset, onGetCode, presets, activePresetId, onPresetSelect, onPresetSave, onPresetDelete, collapsed, onToggleCollapsed }) {
  const set = (key) => (val) => onChange({ ...config, [key]: val });
  const isShader = config.gradientMode === 'shader';

  const handlePointChange = useCallback((index, updated) => {
    const pts = [...(config.shaderPoints || [])];
    pts[index] = updated;
    onChange({ ...config, shaderPoints: pts });
  }, [config, onChange]);

  const handlePointRemove = useCallback((index) => {
    const pts = (config.shaderPoints || []).filter((_, i) => i !== index);
    onChange({ ...config, shaderPoints: pts });
  }, [config, onChange]);

  const handlePointAdd = useCallback(() => {
    const pts = [...(config.shaderPoints || [])];
    if (pts.length >= 8) return;
    pts.push({ x: 0.5, y: 0.5, color: '#ffffff', width: 0.3, height: 0.3, angle: 0, intensity: 0.5 });
    onChange({ ...config, shaderPoints: pts });
  }, [config, onChange]);

  const cssBg = {
    background: 'linear-gradient(135deg, #c8daf0, #f0e8e4, #d8c8d8)',
  };
  const shaderBg = {
    background: 'conic-gradient(from 180deg, #6BA3CC, #F5EDE8, #D4937A, #C8B0D0, #6BA3CC)',
    filter: 'blur(3px)',
  };

  return (
    <Panel
      title="BG Grain"
      subtitle="Full-screen grain texture background."
      collapsed={collapsed}
      onToggleCollapsed={onToggleCollapsed}
      footer={
        <div className="flex gap-1.5">
          <Button onClick={onGetCode} className="flex-1">Get Code</Button>
          <Button onClick={onReset} className="flex-1">Reset</Button>
        </div>
      }
    >
      <Section title="Background">
        <ColorPicker label="Page color" value={config.bgColor || '#ffffff'} onChange={set('bgColor')} />
        <div className="flex items-center gap-2 mb-2 mt-2">
          <ModeThumbnail
            active={!isShader}
            onClick={() => set('gradientMode')('css')}
            label="CSS Gradient"
            bgStyle={cssBg}
          />
          <ModeThumbnail
            active={isShader}
            onClick={() => set('gradientMode')('shader')}
            label="Shader Gradient"
            bgStyle={shaderBg}
          />
        </div>

        {isShader ? (
          <>
            {(config.shaderPoints || []).map((pt, i) => (
              <ControlPointRow
                key={i}
                point={pt}
                index={i}
                onChange={(updated) => handlePointChange(i, updated)}
                onRemove={() => handlePointRemove(i)}
              />
            ))}
            {(config.shaderPoints || []).length < 8 && (
              <Button variant="default" size="sm" onClick={handlePointAdd} className="w-full mb-2 border-dashed border-white/10 text-white/40 hover:text-white/60 hover:border-white/20">
                <PlusIcon className="w-3 h-3 mr-1" /> Add Point
              </Button>
            )}
            <Slider label="Warp Scale" value={config.shaderWarpScale ?? 2.5} min={0.5} max={8} step={0.1} onChange={set('shaderWarpScale')} defaultValue={2.5} />
            <Slider label="Warp Amount" value={config.shaderWarpAmount ?? 0.12} min={0} max={0.4} step={0.005} onChange={set('shaderWarpAmount')} defaultValue={0.12} />
            <Slider label="Warp Detail" value={config.shaderWarpScale2 ?? 4} min={1} max={12} step={0.1} onChange={set('shaderWarpScale2')} defaultValue={4} />
            <Slider label="Detail Amt" value={config.shaderWarpAmount2 ?? 0.06} min={0} max={0.2} step={0.005} onChange={set('shaderWarpAmount2')} defaultValue={0.06} />
            <Slider label="Flow Speed" value={config.shaderWarpSpeed ?? 0.15} min={0} max={1} step={0.01} onChange={set('shaderWarpSpeed')} defaultValue={0.15} />
            <Slider label="Noise Scale" value={config.shaderNoiseScale ?? 2} min={0.5} max={10} step={0.1} onChange={set('shaderNoiseScale')} defaultValue={2} />
            <Slider label="Noise Amount" value={config.shaderNoiseAmount ?? 0.04} min={0} max={0.3} step={0.005} onChange={set('shaderNoiseAmount')} defaultValue={0.04} />
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker label="Color 1" value={config.bgColor1} onChange={set('bgColor1')} />
              <ColorPicker label="Color 2" value={config.bgColor2} onChange={set('bgColor2')} />
              <ColorPicker label="Color 3" value={config.bgColor3} onChange={set('bgColor3')} />
            </div>
            <Select
              label="Type"
              value={config.gradientType}
              options={[
                { value: 'linear', label: 'Linear' },
                { value: 'radial', label: 'Radial' },
              ]}
              onChange={set('gradientType')}
            />
            <Slider label="Angle" value={config.gradientAngle} min={0} max={360} step={1} onChange={set('gradientAngle')} unit="°" defaultValue={150} />
            <Slider label="Midpoint" value={config.gradientMidpoint} min={0.05} max={0.95} step={0.01} onChange={set('gradientMidpoint')} defaultValue={0.48} />
          </>
        )}
      </Section>

      {!isShader && (
        <Section title="Gradient Tone">
          <Slider label="Saturation" value={config.gradientSaturation} min={0} max={2} step={0.01} onChange={set('gradientSaturation')} defaultValue={1} />
          <Slider label="Contrast" value={config.gradientContrast} min={0.6} max={1.8} step={0.01} onChange={set('gradientContrast')} defaultValue={1} />
          <Slider label="Brightness" value={config.gradientBrightness} min={0.7} max={1.4} step={0.01} onChange={set('gradientBrightness')} defaultValue={1} />
          <Slider label="Softness" value={config.gradientSoftness} min={0.5} max={1.8} step={0.01} onChange={set('gradientSoftness')} defaultValue={1} />
          <Slider label="Warmth" value={config.gradientWarmth} min={0.5} max={1.5} step={0.01} onChange={set('gradientWarmth')} defaultValue={1} />
        </Section>
      )}

      <Section title="Grain">
        <Slider label="Amount" value={config.grainAmount} min={0} max={1} step={0.01} onChange={set('grainAmount')} defaultValue={0} />
        <Slider label="Scale" value={config.grainScale} min={0.5} max={8} step={0.1} onChange={set('grainScale')} unit="px" defaultValue={1.5} />
        <Slider label="Speed" value={config.grainSpeed} min={0} max={2} step={0.01} onChange={set('grainSpeed')} defaultValue={0.8} />
        <Slider label="Density" value={config.grainDensity} min={0} max={1} step={0.01} onChange={set('grainDensity')} defaultValue={0.7} />
        <Slider label="Softness" value={config.grainSoftness} min={0} max={1} step={0.01} onChange={set('grainSoftness')} defaultValue={0.15} />
        <Select
          label="Blend mode"
          value={config.grainBlendMode}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'overlay', label: 'Overlay' },
            { value: 'screen', label: 'Screen' },
            { value: 'multiply', label: 'Multiply' },
            { value: 'softLight', label: 'Soft Light' },
          ]}
          onChange={set('grainBlendMode')}
        />
      </Section>

      <Section title="Tone" defaultOpen={false}>
        <Slider label="Contrast" value={config.grainContrast} min={0.2} max={3} step={0.01} onChange={set('grainContrast')} defaultValue={1.2} />
        <Slider label="Brightness" value={config.grainBrightness} min={-0.5} max={0.5} step={0.01} onChange={set('grainBrightness')} defaultValue={0} />
      </Section>

      <Section title="Presets">
        <PresetGrid
          presets={presets}
          activePresetId={activePresetId}
          onSelect={onPresetSelect}
          onSave={onPresetSave}
          onDelete={onPresetDelete}
        />
      </Section>
    </Panel>
  );
}
