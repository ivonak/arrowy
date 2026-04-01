import Panel from '../../components/organisms/Panel';
import Section from '../../components/organisms/Section';
import Slider from '../../components/molecules/Slider';
import Toggle from '../../components/atoms/Toggle';
import ColorPicker from '../../components/molecules/ColorPicker';
import ColorSwapPair from '../../components/molecules/ColorSwapPair';
import Select from '../../components/molecules/Select';
import Button from '../../components/atoms/Button';
import PresetGrid from '../../components/organisms/PresetGrid';

export default function GridPanel({ config, onChange, onReset, onGetCode, onRegenBlob, presets, activePresetId, onPresetSelect, onPresetSave, onPresetDelete, collapsed, onToggleCollapsed }) {
  const set = (key) => (val) => onChange({ ...config, [key]: val });

  return (
    <Panel
      title="Grid Playground"
      subtitle="Tune your animated background grid."
      collapsed={collapsed}
      onToggleCollapsed={onToggleCollapsed}
      footer={
        <div className="flex gap-1.5">
          <Button onClick={onGetCode} className="flex-1">Get Code</Button>
          <Button onClick={onReset} className="flex-1">Reset</Button>
        </div>
      }
    >
      <Section title="Colors">
        <div className="grid grid-cols-2 gap-2">
          <ColorPicker label="Gradient start" value={config.bgStart} onChange={set('bgStart')} />
          <ColorPicker label="Gradient middle" value={config.bgMid} onChange={set('bgMid')} />
          <ColorPicker label="Gradient end" value={config.bgEnd} onChange={set('bgEnd')} />
          <ColorPicker label="Dot color" value={config.dotColor} onChange={set('dotColor')} />
        </div>
      </Section>

      <Section title="Dots">
        <Slider label="Dot base opacity" value={config.dotOpacity} min={0.01} max={0.25} step={0.01} onChange={set('dotOpacity')} defaultValue={0.06} />
        <Slider label="Dot final opacity" value={config.dotFinalOpacity} min={0.05} max={1} step={0.01} onChange={set('dotFinalOpacity')} defaultValue={0.55} />
        <Slider label="Grid spacing" value={config.gridSpacing} min={10} max={60} step={1} onChange={set('gridSpacing')} unit="px" defaultValue={24} />
        <Slider label="Dot size" value={config.dotSize} min={0.6} max={2.4} step={0.1} onChange={set('dotSize')} unit="px" defaultValue={1} />
        <Slider label="Dot sharpness" value={config.dotSharpness} min={0.6} max={2.2} step={0.01} onChange={set('dotSharpness')} defaultValue={1.3} />
      </Section>

      <Section title="Deformation" defaultOpen={false}>
        <Select
          label="Shape"
          value={config.shapeType}
          options={[
            { value: 'circle', label: 'Circle' },
            { value: 'ellipse', label: 'Ellipse' },
            { value: 'roundedSquare', label: 'Rounded square' },
            { value: 'randomBlob', label: 'Random blob' },
          ]}
          onChange={set('shapeType')}
        />
        <Slider label="Influence radius" value={config.influenceRadius} min={40} max={420} step={2} onChange={set('influenceRadius')} unit="px" defaultValue={180} />
        <Slider label="Shape stretch X" value={config.shapeStretchX} min={0.6} max={1.6} step={0.01} onChange={set('shapeStretchX')} defaultValue={1} />
        <Slider label="Shape stretch Y" value={config.shapeStretchY} min={0.6} max={1.6} step={0.01} onChange={set('shapeStretchY')} defaultValue={1} />
        <Slider label="Ball roundness" value={config.ballRoundness} min={0} max={1.2} step={0.01} onChange={set('ballRoundness')} defaultValue={0.7} />
        <Slider label="Compression strength" value={config.compressionStrength} min={0} max={1.2} step={0.01} onChange={set('compressionStrength')} defaultValue={0.62} />
        <Slider label="Dot separation (local)" value={config.dotSeparation} min={0.75} max={1.8} step={0.01} onChange={set('dotSeparation')} defaultValue={1.05} />
        <Slider label="Blob lobes" value={config.blobLobes} min={2} max={12} step={1} onChange={set('blobLobes')} defaultValue={6} />
        <Slider label="Blob jaggedness" value={config.blobJaggedness} min={0} max={0.8} step={0.01} onChange={set('blobJaggedness')} defaultValue={0.25} />
        <Slider label="Blob scale" value={config.blobScale} min={0.6} max={1.4} step={0.01} onChange={set('blobScale')} defaultValue={1} />
        <Button onClick={onRegenBlob}>Regenerate blob</Button>
      </Section>

      <Section
        title="Grain"
        defaultOpen={false}
        toggle
        toggleValue={config.grainEnabled}
        onToggleChange={set('grainEnabled')}
      >
        <ColorSwapPair
          labelA="Back color"
          labelB="Front color"
          valueA={config.grainBackColor}
          valueB={config.grainFrontColor}
          onChange={({ a, b }) => onChange({ ...config, grainBackColor: a, grainFrontColor: b })}
        />
        <Slider label="Back opacity" value={config.grainBackOpacity} min={0} max={1.5} step={0.01} onChange={set('grainBackOpacity')} defaultValue={1} />
        <Slider label="Front opacity" value={config.grainFrontOpacity} min={0} max={1.5} step={0.01} onChange={set('grainFrontOpacity')} defaultValue={1} />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Select
            label="Background mode"
            value={config.grainBgMode}
            options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]}
            onChange={set('grainBgMode')}
          />
          <Select
            label="Blend mode"
            value={config.grainBlendMode}
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'screen', label: 'Screen' },
              { value: 'add', label: 'Add' },
              { value: 'multiply', label: 'Multiply' },
            ]}
            onChange={set('grainBlendMode')}
          />
        </div>
        <Slider label="Amount" value={config.grainAmount} min={0} max={1} step={0.01} onChange={set('grainAmount')} defaultValue={0.35} />
        <Slider label="Spread" value={config.grainSpread} min={0} max={1.5} step={0.01} onChange={set('grainSpread')} defaultValue={0.35} />
        <Slider label="Bias (-back / +front)" value={config.grainBias} min={-1} max={1} step={0.01} onChange={set('grainBias')} defaultValue={0.35} />
        <Slider label="Offset" value={config.grainOffset} min={-2} max={2} step={0.01} onChange={set('grainOffset')} defaultValue={0.35} />
        <Slider label="Intensity" value={config.grainIntensity} min={0.01} max={0.5} step={0.01} onChange={set('grainIntensity')} defaultValue={0.15} />
        <Slider label="Radial falloff" value={config.grainRadialFalloff} min={0.5} max={12} step={0.1} onChange={set('grainRadialFalloff')} defaultValue={2} />
        <Slider label="Edge steepness" value={config.grainEdgeSteepness} min={0.3} max={5} step={0.05} onChange={set('grainEdgeSteepness')} defaultValue={1} />
        <Slider label="Density" value={config.grainDensityScale} min={0.02} max={1} step={0.01} onChange={set('grainDensityScale')} defaultValue={1} />
        <Slider label="Falloff onset" value={config.grainFalloffOnset} min={0} max={1} step={0.01} onChange={set('grainFalloffOnset')} defaultValue={1} />
      </Section>

      <Section title="Motion" defaultOpen={false}>
        <Slider label="Motion speed" value={config.motionSpeed} min={0.01} max={1.4} step={0.005} onChange={set('motionSpeed')} defaultValue={0.55} />
        <Slider label="Wave amount" value={config.waveAmount} min={0.04} max={0.34} step={0.01} onChange={set('waveAmount')} defaultValue={0.14} />
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
