import { useState } from 'react';
import ColorPicker from '../../components/molecules/ColorPicker';
import Slider from '../../components/molecules/Slider';
import Button from '../../components/atoms/Button';
import CloseIcon from '../../components/atoms/icons/CloseIcon';
import ChevronIcon from '../../components/atoms/icons/ChevronIcon';

export default function ControlPointRow({ point, index, onChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const set = (key) => (val) => onChange({ ...point, [key]: val });

  return (
    <div className="bg-surface rounded-md mb-2 overflow-hidden">
      <div
        className="flex items-center justify-between px-2 py-1.5 cursor-pointer select-none hover:bg-white/3 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div onClick={e => e.stopPropagation()}>
          <ColorPicker label={`Point ${index + 1}`} value={point.color} onChange={set('color')} />
        </div>
        <div className="flex items-center gap-1">
          <ChevronIcon className={`w-2.5 h-2.5 text-white/30 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            title="Remove"
          >
            <CloseIcon className="w-2.5 h-2.5" />
          </Button>
        </div>
      </div>
      {open && (
        <div className="px-2.5 pb-2">
          <Slider label="X" value={point.x} min={-0.2} max={1.2} step={0.01} onChange={set('x')} defaultValue={0.5} />
          <Slider label="Y" value={point.y} min={-0.2} max={1.2} step={0.01} onChange={set('y')} defaultValue={0.5} />
          <Slider label="Width" value={point.width ?? 0.3} min={0.05} max={1.5} step={0.01} onChange={set('width')} defaultValue={0.3} />
          <Slider label="Height" value={point.height ?? 0.3} min={0.05} max={1.5} step={0.01} onChange={set('height')} defaultValue={0.3} />
          <Slider label="Angle" value={point.angle ?? 0} min={-90} max={90} step={1} onChange={set('angle')} unit="°" defaultValue={0} />
          <Slider label="Intensity" value={point.intensity} min={0} max={1} step={0.01} onChange={set('intensity')} defaultValue={0.5} />
        </div>
      )}
    </div>
  );
}
