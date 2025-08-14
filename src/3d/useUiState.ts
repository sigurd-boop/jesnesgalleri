import { create } from 'zustand';

export type Tab = 'about' | 'experience' | 'projects' | 'contact';

interface UiState {
  activeTab: Tab;
  scanlines: boolean;
  brightness: number;
  setActiveTab: (tab: Tab) => void;
  setScanlines: (value: boolean) => void;
  setBrightness: (value: number) => void;
}

export const useUiState = create<UiState>((set) => ({
  activeTab: 'about',
  scanlines: true,
  brightness: 1,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setScanlines: (value) => set({ scanlines: value }),
  setBrightness: (value) =>
    set({ brightness: Math.min(1.4, Math.max(0.5, value)) }),
}));

