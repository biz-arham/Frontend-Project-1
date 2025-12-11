import { create } from 'zustand';
import { Client, Project } from '@/types';
import { mockClients, mockProjects } from '@/data/mockData';

interface ClientStore {
  clients: Client[];
  projects: Project[];
  searchQuery: string;
  statusFilter: 'all' | 'pending' | 'ongoing' | 'completed';
  tagFilter: string[];
  
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: 'all' | 'pending' | 'ongoing' | 'completed') => void;
  setTagFilter: (tags: string[]) => void;
  
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  getClientById: (id: string) => Client | undefined;
  getProjectsByClientId: (clientId: string) => Project[];
  getClientByProjectId: (projectId: string) => Client | undefined;
}

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: mockClients,
  projects: mockProjects,
  searchQuery: '',
  statusFilter: 'all',
  tagFilter: [],
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setTagFilter: (tags) => set({ tagFilter: tags }),
  
  addClient: (clientData) => {
    const newClient: Client = {
      ...clientData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ clients: [...state.clients, newClient] }));
  },
  
  updateClient: (id, clientData) => {
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === id ? { ...c, ...clientData, updatedAt: new Date() } : c
      ),
    }));
  },
  
  deleteClient: (id) => {
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
      projects: state.projects.filter((p) => p.clientId !== id),
    }));
  },
  
  addProject: (projectData) => {
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ projects: [...state.projects, newProject] }));
  },
  
  updateProject: (id, projectData) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...projectData, updatedAt: new Date() } : p
      ),
    }));
  },
  
  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    }));
  },
  
  getClientById: (id) => get().clients.find((c) => c.id === id),
  
  getProjectsByClientId: (clientId) =>
    get().projects.filter((p) => p.clientId === clientId),
  
  getClientByProjectId: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return undefined;
    return get().clients.find((c) => c.id === project.clientId);
  },
}));
