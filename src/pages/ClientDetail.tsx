import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { ClientForm } from '@/components/clients/ClientForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  ArrowLeft, Mail, Phone, Globe, Building2, User, 
  Calendar, DollarSign, FolderKanban, Edit, Plus, ExternalLink
} from 'lucide-react';
import { tagColors } from '@/data/mockData';

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  upwork_profile_url: string | null;
  company_name: string | null;
  company_website: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
}

interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  price: number;
  deadline: string | null;
  status: 'pending' | 'ongoing' | 'completed';
  store_url: string | null;
  notes: string | null;
  created_at: string;
}

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState(false);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    if (id && user) {
      fetchClientData();
    }
  }, [id, user]);

  const fetchClientData = async () => {
    if (!id) return;
    
    const [clientRes, projectsRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).maybeSingle(),
      supabase.from('projects').select('*').eq('client_id', id).order('created_at', { ascending: false })
    ]);

    if (clientRes.error) {
      toast.error('Failed to load client');
      navigate('/clients');
      return;
    }

    setClient(clientRes.data);
    setProjects((projectsRes.data || []) as Project[]);
    setLoading(false);
  };

  const handleClientUpdate = async (data: any) => {
    if (!id) return;
    const { error } = await supabase.from('clients').update({
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      upwork_profile_url: data.upworkProfileUrl || null,
      company_name: data.companyName || null,
      company_website: data.companyWebsite || null,
      notes: data.notes || null,
      tags: data.tags || []
    }).eq('id', id);

    if (error) {
      toast.error('Failed to update client');
    } else {
      toast.success('Client updated');
      fetchClientData();
      setEditingClient(false);
    }
  };

  const handleProjectSubmit = async (data: any) => {
    if (!user || !id) return;

    if (editingProject) {
      const { error } = await supabase.from('projects').update({
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
        client_id: id,
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

    fetchClientData();
    setEditingProject(null);
    setProjectFormOpen(false);
  };

  const totalRevenue = projects.reduce((sum, p) => sum + Number(p.price), 0);
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold">Client not found</h2>
          <Button className="mt-4" onClick={() => navigate('/clients')}>
            Back to Clients
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{client.full_name}</h1>
            <p className="text-muted-foreground">{client.company_name || 'Independent Client'}</p>
          </div>
          <Button variant="outline" onClick={() => setEditingClient(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                    {client.email}
                  </a>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.upwork_profile_url && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a href={client.upwork_profile_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Upwork Profile
                    </a>
                  </div>
                )}
                {client.company_website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={client.company_website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {client.company_website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Client since {format(new Date(client.created_at), 'MMM yyyy')}
                  </span>
                </div>
                
                {client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {client.tags.map(tag => (
                      <Badge key={tag} style={{ backgroundColor: tagColors[tag] || '#6366f1' }}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {client.notes && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">{client.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4 border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-semibold text-primary">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Projects</span>
                  <span className="font-semibold">{projects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold text-success">{completedProjects}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                Projects ({projects.length})
              </h2>
              <Button onClick={() => { setEditingProject(null); setProjectFormOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </div>

            {projects.length === 0 ? (
              <Card className="border-dashed border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FolderKanban className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No projects yet</p>
                  <Button className="mt-4" onClick={() => setProjectFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project, index) => (
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
                      updatedAt: new Date(project.created_at)
                    }}
                    index={index}
                    onEdit={() => {
                      setEditingProject(project);
                      setProjectFormOpen(true);
                    }}
                    hideClient
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <ClientForm
          open={editingClient}
          onOpenChange={setEditingClient}
          client={client ? {
            id: client.id,
            fullName: client.full_name,
            email: client.email,
            phone: client.phone || undefined,
            upworkProfileUrl: client.upwork_profile_url || undefined,
            companyName: client.company_name || undefined,
            companyWebsite: client.company_website || undefined,
            notes: client.notes || undefined,
            tags: client.tags,
            createdAt: new Date(client.created_at),
            updatedAt: new Date(client.created_at)
          } : null}
          onSubmit={handleClientUpdate}
        />

        <ProjectForm
          open={projectFormOpen}
          onOpenChange={setProjectFormOpen}
          project={editingProject ? {
            id: editingProject.id,
            clientId: editingProject.client_id,
            title: editingProject.title,
            description: editingProject.description || undefined,
            price: Number(editingProject.price),
            deadline: editingProject.deadline ? new Date(editingProject.deadline) : undefined,
            status: editingProject.status,
            storeUrl: editingProject.store_url || undefined,
            notes: editingProject.notes || undefined,
            createdAt: new Date(editingProject.created_at),
            updatedAt: new Date(editingProject.created_at)
          } : null}
          onSubmit={handleProjectSubmit}
          fixedClientId={id}
        />
      </div>
    </AppLayout>
  );
};

export default ClientDetail;
