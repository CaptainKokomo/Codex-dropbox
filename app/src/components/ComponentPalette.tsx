import { useMemo } from 'react';
import { useComponentCatalog } from '../data/components';
import { useCanvas } from '../state/canvasStore';
import { useUI } from '../state/uiStore';
import type { ComponentBlueprint } from '../data/components';

export const ComponentPalette = () => {
  const { components } = useComponentCatalog();
  const { addComponentTemplate } = useCanvas();
  const { languageStyle } = useUI();

  const groups = useMemo(() => {
    return components.reduce<Record<string, ComponentBlueprint[]>>((acc, component) => {
      const group = component.category ?? 'Core';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(component);
      return acc;
    }, {});
  }, [components]);

  return (
    <nav className="flex h-full flex-col overflow-y-auto" aria-label="Component palette">
      {Object.entries(groups).map(([group, entries]) => (
        <section key={group} className="border-b border-slate-800 px-4 py-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {group}
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {entries.map((component) => (
              <button
                key={component.type}
                onClick={() => addComponentTemplate(component)}
                className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-left text-sm hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="font-medium">{component.label}</span>
                <span className="text-xs text-slate-400">
                  {languageStyle === 'simple' ? component.simpleDescription : component.detailedDescription}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </nav>
  );
};
