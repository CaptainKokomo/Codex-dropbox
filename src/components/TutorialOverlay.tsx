import { useCircuitStore } from '../state/store';
import './TutorialOverlay.css';

const steps = [
  'Drop a battery, resistor, LED, and 555 timer onto the canvas.',
  'Connect the battery positive to the resistor, then to the LED anode.',
  'Wire the LED cathode back to battery negative.',
  'Link the 555 timer pins using the prefab hints to complete the blinker.',
  'Hit Run to watch the LED blink. Tweak values for brightness and speed.'
];

export const TutorialOverlay = () => {
  const tutorial = useCircuitStore((state) => state.tutorial);
  const addCoaching = useCircuitStore((state) => state.addCoachingMessage);
  const setTutorialStep = (step: number) => {
    useCircuitStore.setState((state) => ({ tutorial: { ...state.tutorial, step } }));
  };

  if (tutorial.completed) return null;

  return (
    <div className="tutorial-overlay">
      <div className="card">
        <div className="title">Blink an LED</div>
        <p>{steps[tutorial.step]}</p>
        <div className="actions">
          <button disabled={tutorial.step === 0} onClick={() => setTutorialStep(tutorial.step - 1)}>
            Back
          </button>
          <button
            onClick={() => {
              if (tutorial.step + 1 >= steps.length) {
                addCoaching('Tutorial complete! Try your own circuit.', 'info');
                useCircuitStore.setState((state) => ({
                  tutorial: { ...state.tutorial, completed: true }
                }));
              } else {
                setTutorialStep(tutorial.step + 1);
              }
            }}
          >
            {tutorial.step + 1 >= steps.length ? 'Finish' : 'Next' }
          </button>
        </div>
      </div>
    </div>
  );
};
