import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Sign, SignType } from '@/lib/zod/schemas';

interface SignsState {
  signs: Sign[];
  signTypes: SignType[];
  setSigns: (signs: Sign[]) => void;
  setSignTypes: (signTypes: SignType[]) => void;
  addSign: (sign: Sign) => void;
  updateSign: (id: string, updates: Partial<Sign>) => void;
  deleteSign: (id: string) => void;
  addSignType: (signType: SignType) => void;
  updateSignType: (id: string, updates: Partial<SignType>) => void;
  deleteSignType: (id: string) => void;
  getSignById: (id: string) => Sign | undefined;
  getSignsByProjectId: (projectId: string) => Sign[];
  getSignTypesByProjectId: (projectId: string) => SignType[];
  getSignTypeById: (id: string) => SignType | undefined;
  bulkUpdateSigns: (signIds: string[], updates: Partial<Sign>) => void;
}

export const useSignsStore = create<SignsState>()(
  persist(
    (set, get) => ({
      signs: [],
      signTypes: [],
      setSigns: (signs) => set({ signs }),
      setSignTypes: (signTypes) => set({ signTypes }),
      addSign: (sign) => set((state) => ({ signs: [...state.signs, sign] })),
      updateSign: (id, updates) => set((state) => ({
        signs: state.signs.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteSign: (id) => set((state) => ({
        signs: state.signs.filter(s => s.id !== id)
      })),
      addSignType: (signType) => set((state) => ({ signTypes: [...state.signTypes, signType] })),
      updateSignType: (id, updates) => set((state) => ({
        signTypes: state.signTypes.map(st => st.id === id ? { ...st, ...updates } : st)
      })),
      deleteSignType: (id) => set((state) => ({
        signTypes: state.signTypes.filter(st => st.id !== id)
      })),
      getSignById: (id) => get().signs.find(s => s.id === id),
      getSignsByProjectId: (projectId) => get().signs.filter(s => s.projectId === projectId),
      getSignTypesByProjectId: (projectId) => get().signTypes.filter(st => st.projectId === projectId),
      getSignTypeById: (id) => get().signTypes.find(st => st.id === id),
      bulkUpdateSigns: (signIds, updates) => set((state) => ({
        signs: state.signs.map(s => 
          signIds.includes(s.id) ? { ...s, ...updates } : s
        )
      })),
    }),
    {
      name: 'signs-storage',
    }
  )
);
