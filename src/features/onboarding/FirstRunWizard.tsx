import React, { useMemo } from 'react';
import classNames from 'classnames';
import { usePreferencesStore } from '../../state/preferences.js';

const wizardTelemetry = async (stepId: string, phase: 'enter' | 'exit') => {
  await window.nodelab.recordTelemetry({
    type: phase === 'enter' ? 'wizard-step-enter' : 'wizard-step-exit',
    step: stepId,
    timestamp: new Date().toISOString(),
  });
};

export const FirstRunWizard: React.FC = () => {
  const wizard = usePreferencesStore((state) => state.wizard);
  const preferences = usePreferencesStore((state) => state.preferences);
  const advanceStep = usePreferencesStore((state) => state.advanceStep);
  const updatePreferences = usePreferencesStore((state) => state.updatePreferences);
  const setPreferences = usePreferencesStore((state) => state.setPreferences);

  const currentStep = wizard.steps[wizard.currentStepIndex];

  React.useEffect(() => {
    if (currentStep) {
      void wizardTelemetry(currentStep.id, 'enter');
    }
    return () => {
      if (currentStep) {
        void wizardTelemetry(currentStep.id, 'exit');
      }
    };
  }, [currentStep?.id]);

  const progressPercentage = useMemo(() => {
    return ((wizard.currentStepIndex + 1) / wizard.steps.length) * 100;
  }, [wizard.currentStepIndex, wizard.steps.length]);

  const handlePrimary = async () => {
    if (!currentStep) return;

    if (currentStep.id === 'save-folder') {
      const folder = await window.nodelab.chooseFolder();
      if (!folder) {
        return;
      }
      const next = await window.nodelab.updatePreferences({ saveFolder: folder });
      setPreferences(next);
      await advanceStep();
      return;
    }

    if (currentStep.id === 'auto-update') {
      await advanceStep();
      return;
    }

    if (currentStep.id === 'tour') {
      await advanceStep();
      return;
    }

    await advanceStep();
  };

  const secondaryLabel = currentStep?.id === 'auto-update' ? (preferences?.autoUpdateEnabled ? 'Turn off auto-update' : 'Keep auto-update on') : undefined;

  return (
    <div className="wizard-shell">
      <div className="wizard-card">
        <header className="wizard-header">
          <div className="wizard-progress">
            <div className="wizard-progress-bar" style={{ width: `${progressPercentage}%` }} />
          </div>
          <span className="wizard-step-label">
            Step {wizard.currentStepIndex + 1} of {wizard.steps.length}
          </span>
        </header>
        <main className="wizard-body">
          <h1>{currentStep?.title}</h1>
          <p>{currentStep?.description}</p>
        </main>
        <footer className="wizard-footer">
          {currentStep?.id === 'auto-update' && (
            <button
              className={classNames('wizard-secondary')}
              type="button"
              onClick={async () => {
                const toggled = !(preferences?.autoUpdateEnabled ?? true);
                await updatePreferences({ autoUpdateEnabled: toggled });
                await window.nodelab.recordTelemetry({
                  type: 'wizard-step-enter',
                  step: `${currentStep.id}-toggle`,
                  timestamp: new Date().toISOString(),
                });
              }}
            >
              {secondaryLabel}
            </button>
          )}
          <button className="wizard-primary" type="button" onClick={handlePrimary}>
            {currentStep?.ctaLabel}
          </button>
        </footer>
      </div>
      <aside className="wizard-sidebar">
        <ul>
          {wizard.steps.map((step, index) => (
            <li
              key={step.id}
              className={classNames({
                active: index === wizard.currentStepIndex,
                done: index < wizard.currentStepIndex,
              })}
            >
              <span className="bullet" />
              <div>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};
