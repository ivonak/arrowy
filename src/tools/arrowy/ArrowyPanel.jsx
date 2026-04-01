import Panel from '../../components/organisms/Panel';
import Section from '../../components/organisms/Section';
import Slider from '../../components/molecules/Slider';
import ColorPicker from '../../components/molecules/ColorPicker';
import Select from '../../components/molecules/Select';
import Button from '../../components/atoms/Button';
import Tabs from '../../components/molecules/Tabs';
import NumberField from '../../components/molecules/NumberField';
import ToggleRow from '../../components/molecules/ToggleRow';
import AnchorBlock from './AnchorBlock';
import { PARAM_GROUPS } from './useArrowyRenderer';

export default function ArrowyPanel({
  features, onFeatureToggle, onThemeToggle,
  gridAnim, onGridAnimChange,
  startAnchor, endAnchor, onStartAnchorChange, onEndAnchorChange,
  startOffset, endOffset, onStartOffsetChange, onEndOffsetChange,
  breakpoints, onBreakpointChange,
  activeTab, tabs, onTabChange,
  curveValues, onCurveChange,
  style, onStyleChange,
  draw, onDrawChange,
  onReset, onCopyValues, onGetCode, onPreviewDraw,
  collapsed, onToggleCollapsed,
}) {
  return (
    <Panel
      title="Arrowy"
      subtitle="Leader Line Tuning Tool"
      collapsed={collapsed}
      onToggleCollapsed={onToggleCollapsed}
      footer={
        <div className="flex gap-[5px] flex-wrap">
          <Button size="sm" onClick={onCopyValues}>Copy Values</Button>
          <Button variant="primary" size="sm" onClick={onGetCode}>Get Code</Button>
          <Button size="sm" onClick={onReset}>Reset</Button>
        </div>
      }
    >
      {/* Features */}
      <Section title="Features">
        <ToggleRow label="Light theme" value={features.theme === 'light'} onChange={onThemeToggle} />
        <ToggleRow label="Responsive scaling" value={features.responsive} onChange={() => onFeatureToggle('responsive')} />
        <ToggleRow label="Scroll interpolation" value={features.scroll} onChange={() => onFeatureToggle('scroll')} />
        <ToggleRow label="Show dots" value={features.dots} onChange={() => onFeatureToggle('dots')} />
        <ToggleRow label="Show handle lines" value={features.handles} onChange={() => onFeatureToggle('handles')} />
        <ToggleRow label="Show start/end handles" value={features.endpoints} onChange={() => onFeatureToggle('endpoints')} />
      </Section>

      {/* Grid Animation */}
      <Section title="Grid Animation" defaultOpen={false}>
        <div className="space-y-1.5">
          {[['Speed A', 'speedA'], ['Speed B', 'speedB'], ['Speed C', 'speedC'], ['Speed D', 'speedD']].map(([label, key]) => (
            <NumberField key={key} label={label} value={gridAnim[key]} min={1} max={20} step={0.1}
              onChange={(v) => onGridAnimChange(key, v)} />
          ))}
          {[['Opacity min', 'opacityLow'], ['Opacity max', 'opacityHigh']].map(([label, key]) => (
            <NumberField key={key} label={label} value={gridAnim[key]} min={0} max={1} step={0.01}
              onChange={(v) => onGridAnimChange(key, v)} />
          ))}
        </div>
      </Section>

      {/* Anchors */}
      <Section title="Anchors" defaultOpen={false}>
        <AnchorBlock
          title="START ELEMENT ANCHOR"
          anchorPoint={startAnchor}
          onAnchorChange={onStartAnchorChange}
          offsetX={Math.abs(startOffset.x)}
          offsetXSide={startOffset.x >= 0 ? 'left' : 'right'}
          offsetY={Math.abs(startOffset.y)}
          offsetYSide={startOffset.y >= 0 ? 'top' : 'bottom'}
          onOffsetChange={(field, val) => {
            if (field === 'xSide') onStartOffsetChange({ ...startOffset, x: val === 'left' ? Math.abs(startOffset.x) : -Math.abs(startOffset.x) });
            else if (field === 'ySide') onStartOffsetChange({ ...startOffset, y: val === 'top' ? Math.abs(startOffset.y) : -Math.abs(startOffset.y) });
            else if (field === 'x') onStartOffsetChange({ ...startOffset, x: startOffset.x >= 0 ? val : -val });
            else if (field === 'y') onStartOffsetChange({ ...startOffset, y: startOffset.y >= 0 ? val : -val });
          }}
        />
        <AnchorBlock
          title="END ELEMENT ANCHOR"
          anchorPoint={endAnchor}
          onAnchorChange={onEndAnchorChange}
          offsetX={Math.abs(endOffset.x)}
          offsetXSide={endOffset.x >= 0 ? 'left' : 'right'}
          offsetY={Math.abs(endOffset.y)}
          offsetYSide={endOffset.y >= 0 ? 'top' : 'bottom'}
          onOffsetChange={(field, val) => {
            if (field === 'xSide') onEndOffsetChange({ ...endOffset, x: val === 'left' ? Math.abs(endOffset.x) : -Math.abs(endOffset.x) });
            else if (field === 'ySide') onEndOffsetChange({ ...endOffset, y: val === 'top' ? Math.abs(endOffset.y) : -Math.abs(endOffset.y) });
            else if (field === 'x') onEndOffsetChange({ ...endOffset, x: endOffset.x >= 0 ? val : -val });
            else if (field === 'y') onEndOffsetChange({ ...endOffset, y: endOffset.y >= 0 ? val : -val });
          }}
        />
      </Section>

      {/* Breakpoints */}
      <Section title="Breakpoints" defaultOpen={false}>
        {[['Min width', 'minWidth'], ['Grow start', 'growStart'], ['Max width', 'maxWidth']].map(([label, key]) => (
          <NumberField key={key} label={label} value={breakpoints[key]} onChange={(v) => onBreakpointChange(key, v)} className="mb-1.5" />
        ))}
        {features.scroll && [['Scroll start', 'scrollStart'], ['Scroll hide', 'scrollHide']].map(([label, key]) => (
          <NumberField key={key} label={label} value={breakpoints[key]} onChange={(v) => onBreakpointChange(key, v)} className="mb-1.5" />
        ))}
      </Section>

      {/* Curve Parameters */}
      <Section title="Curve Parameters">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={onTabChange} />
        {PARAM_GROUPS.map((group) => (
          <div key={group.name} className="mb-2">
            <div className="text-[11px] font-semibold text-text-muted mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: group.color }} />
              {group.name}
            </div>
            {group.keys.map((key) => (
              <Slider
                key={key}
                label={key.endsWith('X') ? 'X' : 'Y'}
                value={curveValues[key]}
                min={-200}
                max={200}
                step={1}
                onChange={(v) => onCurveChange(key, v)}
              />
            ))}
          </div>
        ))}
      </Section>

      {/* Line Style */}
      <Section title="Line Style">
        <ColorPicker label="Gradient color 1" value={style.color1} onChange={(v) => onStyleChange('color1', v)} />
        <ColorPicker label="Gradient color 2" value={style.color2} onChange={(v) => onStyleChange('color2', v)} />
        <Slider label="Stroke width" value={style.strokeWidth} min={1} max={10} step={0.5} onChange={(v) => onStyleChange('strokeWidth', v)} />
        <Slider label="Dash length" value={style.dashLen} min={1} max={30} step={1} onChange={(v) => onStyleChange('dashLen', v)} />
        <Slider label="Dash gap" value={style.dashGap} min={1} max={30} step={1} onChange={(v) => onStyleChange('dashGap', v)} />
        <Slider label="Arrow head size" value={style.arrowSize} min={5} max={50} step={1} onChange={(v) => onStyleChange('arrowSize', v)} />
        <Slider label="Arrow angle" value={style.arrowAngle} min={10} max={90} step={1} onChange={(v) => onStyleChange('arrowAngle', v)} />
        <ColorPicker label="Arrow head color" value={style.arrowColor} onChange={(v) => onStyleChange('arrowColor', v)} />
      </Section>

      {/* Draw Animation */}
      <Section title="Draw Animation" defaultOpen={false}>
        <Slider label="Duration" value={draw.duration} min={0.1} max={3} step={0.1} onChange={(v) => onDrawChange('duration', v)} />
        <ToggleRow label="Use gradient during draw" value={draw.useGradient} onChange={(v) => onDrawChange('useGradient', v)} />
        {!draw.useGradient && (
          <ColorPicker label="Draw color" value={draw.color} onChange={(v) => onDrawChange('color', v)} />
        )}
        <Slider label="Stroke width" value={draw.strokeWidth} min={1} max={10} step={0.5} onChange={(v) => onDrawChange('strokeWidth', v)} />
        <Slider label="Opacity" value={draw.opacity} min={0} max={1} step={0.05} onChange={(v) => onDrawChange('opacity', v)} />
        <Button size="sm" onClick={onPreviewDraw}>Preview Draw Animation</Button>
      </Section>
    </Panel>
  );
}
