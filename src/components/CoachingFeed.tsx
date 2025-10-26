import { useCircuitStore } from '../state/store';
import './CoachingFeed.css';

export const CoachingFeed = () => {
  const coaching = useCircuitStore((state) => state.coaching);
  const showTips = useCircuitStore((state) => state.settings.showTips);

  if (!showTips) return null;

  return (
    <div className="coaching-feed">
      {coaching.slice(-3).map((message) => (
        <div key={message.id} className={`tip ${message.severity}`}>
          {message.text}
        </div>
      ))}
    </div>
  );
};
