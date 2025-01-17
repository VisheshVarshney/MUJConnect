import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDark: boolean;
  ripplePosition: { x: number; y: number } | null;
  toggleDark: (position?: { x: number; y: number }) => void;
  clearRipple: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      ripplePosition: null,
      toggleDark: (position) => {
        set((state) => {
          const newIsDark = !state.isDark;
          // Update the HTML class
          if (newIsDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { 
            isDark: newIsDark,
            ripplePosition: position || null
          };
        });
      },
      clearRipple: () => set({ ripplePosition: null }),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state?.isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }
  )
);