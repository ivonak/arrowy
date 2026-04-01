import Button from '../atoms/Button';
import SwapIcon from '../atoms/icons/SwapIcon';
import ColorPicker from './ColorPicker';

export default function ColorSwapPair({ labelA, labelB, valueA, valueB, onChange }) {
  const handleSwap = () => {
    onChange?.({ a: valueB, b: valueA });
  };

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
      <div>
        <ColorPicker
          label={labelA}
          value={valueA}
          onChange={(v) => onChange?.({ a: v, b: valueB })}
        />
      </div>
      <div className="flex items-center justify-center pb-[2px]">
        <Button
          variant="subtle"
          size="icon-sm"
          onClick={handleSwap}
          title="Swap colors"
        >
          <SwapIcon />
        </Button>
      </div>
      <div>
        <ColorPicker
          label={labelB}
          value={valueB}
          onChange={(v) => onChange?.({ a: valueA, b: v })}
        />
      </div>
    </div>
  );
}
