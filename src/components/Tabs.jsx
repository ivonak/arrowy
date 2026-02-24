export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-[2px] px-0 mb-2.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange?.(tab.id)}
          className={`flex-1 py-[7px] px-2 text-[11px] font-semibold text-center rounded-md border cursor-pointer select-none transition-all duration-150 ${
            tab.id === activeTab
              ? 'bg-accent-bg border-accent-border text-accent'
              : 'bg-white/4 border-white/6 text-white/45 hover:bg-white/8'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
