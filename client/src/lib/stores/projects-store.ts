import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Drawing } from '@/lib/schemas';

interface ProjectsState {
  projects: Project[];
  drawings: Drawing[];
  setProjects: (projects: Project[]) => void;
  setDrawings: (drawings: Drawing[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addDrawing: (drawing: Drawing) => void;
  updateDrawing: (id: string, updates: Partial<Drawing>) => void;
  deleteDrawing: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getDrawingsByProjectId: (projectId: string) => Drawing[];
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      drawings: [],
      setProjects: (projects) => set({ projects }),
      setDrawings: (drawings) => set({ drawings }),
      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        drawings: state.drawings.filter(d => d.projectId !== id)
      })),
      addDrawing: (drawing) => set((state) => ({ drawings: [...state.drawings, drawing] })),
      updateDrawing: (id, updates) => set((state) => ({
        drawings: state.drawings.map(d => d.id === id ? { ...d, ...updates } : d)
      })),
      deleteDrawing: (id) => set((state) => ({
        drawings: state.drawings.filter(d => d.id !== id)
      })),
      getProjectById: (id) => get().projects.find(p => p.id === id),
      getDrawingsByProjectId: (projectId) => get().drawings.filter(d => d.projectId === projectId),
    }),
    {
      name: 'projects-storage',
    }
  )
);
