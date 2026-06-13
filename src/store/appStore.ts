import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  notificationsEnabled: boolean
  setNotificationsEnabled: (enabled: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
)
