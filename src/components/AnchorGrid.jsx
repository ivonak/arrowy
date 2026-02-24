const POINTS = ['tl','tc','tr','cl','cc','cr','bl','bc','br'];

export default function AnchorGrid({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-[3px]">
      {POINTS.map((pt) => (
        <button
          key={pt}
          onClick={() => onChange?.(pt)}
          className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-all duration-150 ${
            pt === value
              ? 'bg-accent-bg border-accent'
              : 'bg-white/5 border-white/18 hover:bg-white/10'
          }`}
        />
      ))}
    </div>
  );
}
