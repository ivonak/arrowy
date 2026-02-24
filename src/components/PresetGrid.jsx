import { useState, useCallback } from 'react';

export default function PresetGrid({
  presets,
  activePresetId,
  onSelect,
  onSave,
  onDelete,
  onRename,
  renderThumbnail,
}) {
  const [newName, setNewName] = useState('');

  const handleSave = useCallback(() => {
    const name = newName.trim();
    if (!name) return;
    onSave?.(name);
    setNewName('');
  }, [newName, onSave]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleSave();
  }, [handleSave]);

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect?.(preset.id)}
            className={`group relative rounded-lg overflow-hidden border transition-all cursor-pointer ${
              preset.id === activePresetId
                ? 'border-accent-border ring-1 ring-accent/30'
                : 'border-white/8 hover:border-white/20'
            }`}
          >
            <div className="aspect-[4/3] bg-surface">
              {renderThumbnail ? renderThumbnail(preset) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[9px] text-text-muted">{preset.name}</span>
                </div>
              )}
            </div>
            <div className="px-1.5 py-1 text-[9px] text-text-dim truncate text-center">
              {preset.name}
            </div>
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(preset.id); }}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white/60 text-[9px] leading-none opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer flex items-center justify-center"
              >
                ×
              </button>
            )}
          </button>
        ))}
      </div>
      {onSave && (
        <div className="flex gap-1.5">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Preset name..."
            className="flex-1 h-7 rounded-md border border-panel-border bg-surface text-white/85 text-[11px] px-2 outline-none focus:border-accent-border"
          />
          <button
            onClick={handleSave}
            className="px-2.5 h-7 rounded-md border border-accent-border bg-accent-bg text-accent text-[11px] font-semibold cursor-pointer hover:bg-accent-dim"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
