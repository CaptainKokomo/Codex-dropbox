import { create } from 'zustand';

type LanguageStyle = 'simple' | 'detailed';

type UIState = {
  beginnerMode: boolean;
  languageStyle: LanguageStyle;
  showExplanations: boolean;
  toggleBeginnerMode: () => void;
  toggleLanguageStyle: () => void;
  toggleExplanations: () => void;
};

export const useUI = create<UIState>((set) => ({
  beginnerMode: true,
  languageStyle: 'simple',
  showExplanations: true,
  toggleBeginnerMode: () => set((state) => ({ beginnerMode: !state.beginnerMode })),
  toggleLanguageStyle: () =>
    set((state) => ({ languageStyle: state.languageStyle === 'simple' ? 'detailed' : 'simple' })),
  toggleExplanations: () => set((state) => ({ showExplanations: !state.showExplanations })),
}));
