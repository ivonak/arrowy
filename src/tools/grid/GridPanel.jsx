import Panel from '../../components/Panel';
import Section from '../../components/Section';
import Slider from '../../components/Slider';
import Toggle from '../../components/Toggle';
import ColorPicker from '../../components/ColorPicker';
import ColorSwapPair from '../../components/ColorSwapPair';
import Select from '../../components/Select';
import Button from '../../components/Button';
import PresetGrid from '../../components/PresetGrid';

export default function GridPanel({ config, onChange, onReset, onRegenBlob, presets, activePresetId, onPresetSelect, onPresetSave, onPresetDelete, collapsed, onToggleCollapsed }) {
  const set = (key) => (val) => onChange({ ...config, [key]: val });

  return (
    <Panel
      title="Grid Playground"
      subtitle="Tune your animated background grid."
      collapsed={collapsed}
      onToggleCollapsed={onToggleCollapsed}
      footer={
        <div className="flex gap-1.5">
          <Button label="Reset" onClick={onReset} className="flex-1" />
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
        <Slider label="Dot base opacity" value={config.dotOpacity} min={0.01} max={0.25} step={0.01} onChange={set('dotOpacity')} />
        <Slider label="Dot final opacity" value={config.dotFinalOpacity} min={0.05} max={1} step={0.01} onChange={set('dotFinalOpacity')} />
        <Slider label="Grid spacing" value={config.gridSpacing} min={10} max={60} step={1} onChange={set('gridSpacing')} unit="px" />
        <Slider label="Dot size" value={config.dotSize} min={0.6} max={2.4} step={0.1} onChange={set('dotSize')} unit="px" />
        <Slider label="Dot sharpness" value={config.dotSharpness} min={0.6} max={2.2} step={0.01} onChange={set('dotSharpness')} />
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
        <Slider label="Influence radius" value={config.influenceRadius} min={40} max={420} step={2} onChange={set('influenceRadius')} unit="px" />
        <Slider label="Shape stretch X" value={config.shapeStretchX} min={0.6} max={1.6} step={0.01} onChange={set('shapeStretchX')} />
        <Slider label="Shape stretch Y" value={config.shapeStretchY} min={0.6} max={1.6} step={0.01} onChange={set('shapeStretchY')} />
        <Slider label="Ball roundness" value={config.ballRoundness} min={0} max={1.2} step={0.01} onChange={set('ballRoundness')} />
        <Slider label="Compression strength" value={config.compressionStrength} min={0} max={1.2} step={0.01} onChange={set('compressionStrength')} />
        <Slider label="Dot separation (local)" value={config.dotSeparation} min={0.75} max={1.8} step={0.01} onChange={set('dotSeparation')} />
        <Slider label="Blob lobes" value={config.blobLobes} min={2} max={12} step={1} onChange={set('blobLobes')} />
        <Slider label="Blob jaggedness" value={config.blobJaggedness} min={0} max={0.8} step={0.01} onChange={set('blobJaggedness')} />
        <Slider label="Blob scale" value={config.blobScale} min={0.6} max={1.4} step={0.01} onChange={set('blobScale')} />
        <Button label="Regenerate blob" onClick={onRegenBlob} />
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
        <Slider label="Back opacity" value={config.grainBackOpacity} min={0} max={1.5} step={0.01} onChange={set('grainBackOpacity')} />
        <Slider label="Front opacity" value={config.grainFrontOpacity} min={0} max={1.5} step={0.01} onChange={set('grainFrontOpacity')} />
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
        <Slider label="Amount" value={config.grainAmount} min={0} max={1} step={0.01} onChange={set('grainAmount')} />
        <Slider label="Spread" value={config.grainSpread} min={0} max={1.5} step={0.01} onChange={set('grainSpread')} />
        <Slider label="Bias (-back / +front)" value={config.grainBias} min={-1} max={1} step={0.01} onChange={set('grainBias')} />
        <Slider label="Offset" value={config.grainOffset} min={-2} max={2} step={0.01} onChange={set('grainOffset')} />
        <Slider label="Intensity" value={config.grainIntensity} min={0.01} max={0.5} step={0.01} onChange={set('grainIntensity')} />
        <Slider label="Radial falloff" value={config.grainRadialFalloff} min={0.5} max={12} step={0.1} onChange={set('grainRadialFalloff')} />
        <Slider label="Edge steepness" value={config.grainEdgeSteepness} min={0.3} max={5} step={0.05} onChange={set('grainEdgeSteepness')} />
        <Slider label="Density" value={config.grainDensityScale} min={0.02} max={1} step={0.01} onChange={set('grainDensityScale')} />
        <Slider label="Falloff onset" value={config.grainFalloffOnset} min={0} max={1} step={0.01} onChange={set('grainFalloffOnset')} />
      </Section>

      <Section title="Motion" defaultOpen={false}>
        <Slider label="Motion speed" value={config.motionSpeed} min={0.01} max={1.4} step={0.005} onChange={set('motionSpeed')} />
        <Slider label="Wave amount" value={config.waveAmount} min={0.04} max={0.34} step={0.01} onChange={set('waveAmount')} />
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
