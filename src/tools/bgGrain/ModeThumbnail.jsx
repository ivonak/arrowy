export default function ModeThumbnail({ active, onClick, label, bgStyle }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`relative w-12 h-8 rounded border-2 overflow-hidden transition-all ${
        active
          ? 'border-white/60 shadow-[0_0_6px_rgba(255,255,255,0.15)]'
          : 'border-white/10 hover:border-white/25'
      }`}
    >
      <div className="absolute inset-0" style={bgStyle} />
    </button>
  );
}
