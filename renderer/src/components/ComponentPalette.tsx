import { useMemo, useState } from 'react';
import { componentLibrary } from '@data/componentLibrary';
import type { CircuitKitReference } from '@state/types';

interface ComponentPaletteProps {
  kits: CircuitKitReference[];
}

export function ComponentPalette({ kits }: ComponentPaletteProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'components' | 'kits'>('components');

  const filteredComponents = useMemo(() => {
    const term = search.toLowerCase();
    return componentLibrary.filter((component) =>
      component.name.toLowerCase().includes(term) || component.description.toLowerCase().includes(term)
    );
  }, [search]);

  return (
    <aside className="component-palette">
      <div className="palette-header">
        <h2>Palette</h2>
        <input
          className="palette-search"
          placeholder="Search parts"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="palette-tabs">
        <button
          className={activeTab === 'components' ? 'active' : ''}
          onClick={() => setActiveTab('components')}
        >
          Components
        </button>
        <button className={activeTab === 'kits' ? 'active' : ''} onClick={() => setActiveTab('kits')}>
          Kits
        </button>
      </div>
      {activeTab === 'components' ? (
        <ul className="palette-list">
          {filteredComponents.map((component) => (
            <li
              key={component.id}
              className="palette-item"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('text/component', JSON.stringify(component));
                event.dataTransfer.effectAllowed = 'copy';
              }}
            >
              <div className="item-icon" aria-hidden>{component.prefab ? '✨' : '🔌'}</div>
              <div className="item-body">
                <strong>{component.name}</strong>
                <p>{component.description}</p>
              </div>
              <span className="item-tag">{component.category}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="palette-list">
          {kits.map((kit) => (
            <li key={kit.id} className="palette-kit">
              <div className="kit-header">
                <span className="kit-title">{kit.title}</span>
                {kit.isGamified && <span className="kit-tag">Quest Ready</span>}
              </div>
              <ul className="kit-contents">
                {kit.contents.map((item) => (
                  <li key={`${kit.id}-${item.componentType}`}>{item.quantity} × {item.componentType}</li>
                ))}
              </ul>
              <button
                className="kit-action"
                onClick={() => {
                  void window.NodeLab?.openLink('https://nodelab.app/kits/' + kit.id);
                }}
              >
                View packing list
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
