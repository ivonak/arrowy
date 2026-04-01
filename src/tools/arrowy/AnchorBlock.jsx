import AnchorGrid from '../../components/molecules/AnchorGrid';
import Input from '../../components/atoms/Input';

export default function AnchorBlock({ title, anchorPoint, onAnchorChange, offsetX, offsetXSide, offsetY, offsetYSide, onOffsetChange }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-[18px] gap-y-1.5 items-start py-3">
      <div className="col-span-2 text-[10px] text-text-dim tracking-wide">{title}</div>
      <div className="col-start-1 row-start-2 row-span-2">
        <AnchorGrid value={anchorPoint} onChange={onAnchorChange} />
      </div>
      <div className="flex items-center gap-[5px]">
        <label className="text-[10px] text-text-dim whitespace-nowrap">X offset</label>
        <select
          value={offsetXSide}
          onChange={(e) => onOffsetChange('xSide', e.target.value)}
          className="w-[58px] bg-surface border border-panel-border rounded text-text text-[10px] px-[5px] py-[3px]"
        >
          <option value="left">left</option>
          <option value="right">right</option>
        </select>
        <Input
          type="number"
          value={offsetX}
          onChange={(e) => onOffsetChange('x', parseInt(e.target.value) || 0)}
          className="w-12 text-[10px] px-[5px] py-[3px] text-center"
        />
      </div>
      <div className="flex items-center gap-[5px]">
        <label className="text-[10px] text-text-dim whitespace-nowrap">Y offset</label>
        <select
          value={offsetYSide}
          onChange={(e) => onOffsetChange('ySide', e.target.value)}
          className="w-[58px] bg-surface border border-panel-border rounded text-text text-[10px] px-[5px] py-[3px]"
        >
          <option value="top">top</option>
          <option value="bottom">bottom</option>
        </select>
        <Input
          type="number"
          value={offsetY}
          onChange={(e) => onOffsetChange('y', parseInt(e.target.value) || 0)}
          className="w-12 text-[10px] px-[5px] py-[3px] text-center"
        />
      </div>
    </div>
  );
}
