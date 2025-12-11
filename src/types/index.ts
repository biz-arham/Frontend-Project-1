export interface Client {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  upworkProfileUrl?: string;
  companyName?: string;
  companyWebsite?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  price: number;
  deadline?: Date;
  status: 'pending' | 'ongoing' | 'completed';
  storeUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalClients: number;
  totalProjects: number;
  totalRevenue: number;
  pendingDeadlines: number;
  ongoingProjects: number;
  completedProjects: number;
}

export type Tag = {
  id: string;
  name: string;
  color: string;
};
