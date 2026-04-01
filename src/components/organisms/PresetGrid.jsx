import { useState, useCallback } from 'react';
import Button from '../atoms/Button';
import CloseIcon from '../atoms/icons/CloseIcon';
import Input from '../atoms/Input';

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
              <Button variant="overlay" size="icon-xs" onClick={(e) => { e.stopPropagation(); onDelete(preset.id); }} title="Delete" className="absolute top-0.5 right-0.5 rounded-full">
                <CloseIcon className="w-2.5 h-2.5" />
              </Button>
            )}
          </button>
        ))}
      </div>
      {onSave && (
        <div className="flex gap-1.5">
          <Input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Preset name..."
            className="flex-1 h-7 px-2"
          />
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
