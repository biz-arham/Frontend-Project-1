import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types';
import { Plus, FolderKanban } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useClientStore } from '@/store/clientStore';

const Projects = () => {
  const { user } = useAuth();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'ongoing' | 'completed'>('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const [projectsRes, clientsRes] = await Promise.all([
      supabase.from('projects').select('*, clients(full_name, tags)').eq('user_id', user?.id).order('created_at', { ascending: false }),
      supabase.from('clients').select('*').eq('user_id', user?.id)
    ]);
    setProjects(projectsRes.data || []);
    setClients(clientsRes.data || []);
    
    // Update store for ProjectForm client dropdown
    const mappedClients = (clientsRes.data || []).map((c: any) => ({
      id: c.id,
      fullName: c.full_name,
      email: c.email,
      companyName: c.company_name,
      tags: c.tags || [],
      createdAt: new Date(c.created_at),
      updatedAt: new Date(c.updated_at || c.created_at)
    }));
    useClientStore.setState({ clients: mappedClients });
    
    setLoading(false);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = searchQuery === '' || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clients?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      const matchesTags = tagFilter.length === 0 ||
        (project.clients?.tags && tagFilter.some((tag: string) => project.clients.tags.includes(tag)));
      
      return matchesSearch && matchesStatus && matchesTags;
    });
  }, [projects, searchQuery, statusFilter, tagFilter]);

  const handleSubmit = async (data: any) => {
    if (!user) return;

    if (editingProject) {
      const { error } = await supabase.from('projects').update({
        client_id: data.clientId,
        title: data.title,
        description: data.description || null,
        price: data.price,
        deadline: data.deadline || null,
        status: data.status,
        store_url: data.storeUrl || null,
        notes: data.notes || null
      }).eq('id', editingProject.id);

      if (error) {
        toast.error('Failed to update project');
      } else {
        toast.success('Project updated');
      }
    } else {
      const { error } = await supabase.from('projects').insert({
        user_id: user.id,
        client_id: data.clientId,
        title: data.title,
        description: data.description || null,
        price: data.price,
        deadline: data.deadline || null,
        status: data.status,
        store_url: data.storeUrl || null,
        notes: data.notes || null
      });

      if (error) {
        toast.error('Failed to create project');
      } else {
        toast.success('Project created');
      }
    }
    
    fetchData();
    setEditingProject(null);
  };

  const handleEdit = (project: any) => {
    setEditingProject({
      id: project.id,
      clientId: project.client_id,
      title: project.title,
      description: project.description || undefined,
      price: Number(project.price),
      deadline: project.deadline ? new Date(project.deadline) : undefined,
      status: project.status,
      storeUrl: project.store_url || undefined,
      notes: project.notes || undefined,
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at || project.created_at)
    });
    setFormOpen(true);
  };

  const handleDelete = async (projectId: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) {
      toast.error('Failed to delete project');
    } else {
      toast.success('Project deleted');
      fetchData();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="mt-1 text-muted-foreground">
              Track and manage all your client projects.
            </p>
          </div>
          <Button onClick={() => { setEditingProject(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>

        <SearchFilter 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          tagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16"
          >
            <FolderKanban className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No projects found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all' || tagFilter.length > 0
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first project.'}
            </p>
            {!searchQuery && statusFilter === 'all' && tagFilter.length === 0 && (
              <Button className="mt-4" onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={{
                  id: project.id,
                  clientId: project.client_id,
                  title: project.title,
                  description: project.description || undefined,
                  price: Number(project.price),
                  deadline: project.deadline ? new Date(project.deadline) : undefined,
                  status: project.status,
                  storeUrl: project.store_url || undefined,
                  notes: project.notes || undefined,
                  createdAt: new Date(project.created_at),
                  updatedAt: new Date(project.updated_at || project.created_at)
                }}
                clientName={project.clients?.full_name}
                index={index}
                onEdit={() => handleEdit(project)}
                onDelete={() => handleDelete(project.id)}
              />
            ))}
          </div>
        )}

        <ProjectForm
          open={formOpen}
          onOpenChange={setFormOpen}
          project={editingProject}
          onSubmit={handleSubmit}
        />
      </div>
    </AppLayout>
  );
};

export default Projects;
