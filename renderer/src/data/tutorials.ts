export interface TutorialStep {
  id: string;
  title: string;
  body: string;
  coachMark?: string;
  tip?: string;
}

export interface TutorialTrack {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  reward?: string;
}

export const blinkTutorial: TutorialTrack = {
  id: 'blink-led',
  title: 'Blink an LED',
  description: 'Drop a few parts and make your LED dance. Guided and gamified.',
  reward: 'Badge: Spark Starter',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to NodeLab',
      body: 'This quick quest shows you how to wire a blinking LED. Drag the Battery from the left panel.',
      coachMark: 'palette',
      tip: 'Every part snaps to the grid. Hover terminals to see their labels.'
    },
    {
      id: 'resistor',
      title: 'Keep it Safe',
      body: 'Add a resistor between the battery and LED to limit current.',
      coachMark: 'canvas',
      tip: 'Use the neon wire glow to confirm the connections.'
    },
    {
      id: 'timer',
      title: 'Add Rhythm',
      body: 'Drop the 555 Timer prefab to make your LED blink automatically.',
      coachMark: 'prefabs',
      tip: 'Prefabs auto-wire pieces so you can focus on experimenting.'
    },
    {
      id: 'run',
      title: 'Go Live',
      body: 'Press Run and watch the multimeter light up with current readings.',
      coachMark: 'top-bar',
      tip: 'Need more brightness? Try adjusting the resistor value in the inspector.'
    }
  ]
};

export const tutorialTracks: TutorialTrack[] = [blinkTutorial];
