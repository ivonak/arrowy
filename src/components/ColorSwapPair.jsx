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
        <button
          onClick={handleSwap}
          className="w-[22px] h-[22px] rounded-full border border-white/18 bg-surface text-white/86 text-xs leading-none cursor-pointer hover:bg-surface-active hover:text-white"
          title="Swap colors"
        >
          ⇄
        </button>
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
