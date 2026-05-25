import { create } from 'zustand';
import { Assignment, GeneratedPaper } from '@/types';
import * as api from '@/lib/api';

interface AssignmentStore {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  generatedPaper: GeneratedPaper | null;
  isLoading: boolean;
  isGenerating: boolean;
  generationProgress: number;
  error: string | null;
  searchQuery: string;

  fetchAssignments: (search?: string) => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  createAssignment: (data: Record<string, any>) => Promise<Assignment>;
  deleteAssignment: (id: string) => Promise<void>;
  triggerGeneration: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setGenerationProgress: (progress: number) => void;
  setGeneratedPaper: (paper: GeneratedPaper) => void;
  setIsGenerating: (val: boolean) => void;
  setCurrentAssignment: (assignment: Assignment | null) => void;
  clearError: () => void;
}

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  assignments: [],
  currentAssignment: null,
  generatedPaper: null,
  isLoading: false,
  isGenerating: false,
  generationProgress: 0,
  error: null,
  searchQuery: '',

  fetchAssignments: async (search?: string) => {
    set({ isLoading: true, error: null });
    try {
      const assignments = await api.getAssignments(search);
      set({ assignments, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchAssignment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const assignment = await api.getAssignment(id);
      set({
        currentAssignment: assignment,
        generatedPaper: assignment.generatedPaper || null,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createAssignment: async (data: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const assignment = await api.createAssignment(data);
      set((state) => ({
        assignments: [assignment, ...state.assignments],
        currentAssignment: assignment,
        isLoading: false,
      }));
      return assignment;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteAssignment: async (id: string) => {
    try {
      await api.deleteAssignment(id);
      set((state) => ({
        assignments: state.assignments.filter((a) => a._id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  triggerGeneration: async (id: string) => {
    set({ isGenerating: true, generationProgress: 0, error: null });
    try {
      await api.generatePaper(id);
    } catch (err: any) {
      set({ error: err.message, isGenerating: false });
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setGenerationProgress: (progress: number) => set({ generationProgress: progress }),
  setGeneratedPaper: (paper: GeneratedPaper) => set({ generatedPaper: paper, isGenerating: false, generationProgress: 100 }),
  setIsGenerating: (val: boolean) => set({ isGenerating: val }),
  setCurrentAssignment: (assignment: Assignment | null) => set({ currentAssignment: assignment }),
  clearError: () => set({ error: null }),
}));
