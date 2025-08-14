import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  density: 'compact' | 'comfy';
  cmdkOpen: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setDensity: (density: 'compact' | 'comfy') => void;
  setCmdkOpen: (open: boolean) => void;
  toggleTheme: () => void;
  toggleDensity: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      density: 'comfy',
      cmdkOpen: false,
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      setCmdkOpen: (cmdkOpen) => set({ cmdkOpen }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      toggleDensity: () => set((state) => ({ density: state.density === 'compact' ? 'comfy' : 'compact' })),
    }),
    {
      name: 'ui-storage',
    }
  )
);
