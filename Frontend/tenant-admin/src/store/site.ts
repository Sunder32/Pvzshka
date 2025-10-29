import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Site {
  id: string
  siteName: string
  domain: string
  category: string
  isEnabled: boolean
}

interface SiteState {
  activeSiteId: string | null
  activeSite: Site | null
  sites: Site[]
  setActiveSite: (site: Site) => void
  setSites: (sites: Site[]) => void
  clearActiveSite: () => void
}

export const useSiteStore = create<SiteState>()(
  persist(
    (set) => ({
      activeSiteId: null,
      activeSite: null,
      sites: [],
      setActiveSite: (site: Site) => {
        set({ 
          activeSiteId: site.id, 
          activeSite: site 
        })
      },
      setSites: (sites: Site[]) => {
        set({ sites })
        // Auto-select first site if no active site
        if (sites.length > 0) {
          set((state) => {
            if (!state.activeSiteId) {
              return {
                activeSiteId: sites[0].id,
                activeSite: sites[0]
              }
            }
            return state
          })
        }
      },
      clearActiveSite: () => {
        set({ activeSiteId: null, activeSite: null, sites: [] })
      },
    }),
    {
      name: 'tenant-admin-site',
    }
  )
)
