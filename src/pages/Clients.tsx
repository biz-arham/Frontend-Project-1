import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClientCard } from '@/components/clients/ClientCard';
import { ClientForm } from '@/components/clients/ClientForm';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types';
import { Plus, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const [clientsRes, projectsRes] = await Promise.all([
      supabase.from('clients').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
      supabase.from('projects').select('*').eq('user_id', user?.id)
    ]);
    setClients(clientsRes.data || []);
    setProjects(projectsRes.data || []);
    setLoading(false);
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch = searchQuery === '' || 
        client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = tagFilter.length === 0 ||
        tagFilter.some((tag) => client.tags?.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [clients, searchQuery, tagFilter]);

  const handleSubmit = async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    if (editingClient) {
      const { error } = await supabase.from('clients').update({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        upwork_profile_url: data.upworkProfileUrl || null,
        company_name: data.companyName || null,
        company_website: data.companyWebsite || null,
        notes: data.notes || null,
        tags: data.tags || []
      }).eq('id', editingClient.id);

      if (error) {
        toast.error('Failed to update client');
      } else {
        toast.success('Client updated');
      }
    } else {
      const { error } = await supabase.from('clients').insert({
        user_id: user.id,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        upwork_profile_url: data.upworkProfileUrl || null,
        company_name: data.companyName || null,
        company_website: data.companyWebsite || null,
        notes: data.notes || null,
        tags: data.tags || []
      });

      if (error) {
        toast.error('Failed to create client');
      } else {
        toast.success('Client created');
      }
    }
    
    fetchData();
    setEditingClient(null);
  };

  const handleEdit = (client: any) => {
    setEditingClient({
      id: client.id,
      fullName: client.full_name,
      email: client.email,
      phone: client.phone || undefined,
      upworkProfileUrl: client.upwork_profile_url || undefined,
      companyName: client.company_name || undefined,
      companyWebsite: client.company_website || undefined,
      notes: client.notes || undefined,
      tags: client.tags || [],
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at || client.created_at)
    });
    setFormOpen(true);
  };

  const handleDelete = async (clientId: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) {
      toast.error('Failed to delete client');
    } else {
      toast.success('Client deleted');
      fetchData();
    }
  };

  const getProjectStats = (clientId: string) => {
    const clientProjects = projects.filter(p => p.client_id === clientId);
    return {
      count: clientProjects.length,
      ongoing: clientProjects.filter(p => p.status === 'ongoing').length,
      revenue: clientProjects.reduce((sum, p) => sum + Number(p.price), 0)
    };
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clients</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your Upwork clients and their information.
            </p>
          </div>
          <Button onClick={() => { setEditingClient(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        <SearchFilter 
          showStatusFilter={false} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          tagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredClients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16"
          >
            <Users className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No clients found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || tagFilter.length > 0
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first client.'}
            </p>
            {!searchQuery && tagFilter.length === 0 && (
              <Button className="mt-4" onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredClients.map((client, index) => (
              <ClientCard
                key={client.id}
                client={{
                  id: client.id,
                  fullName: client.full_name,
                  email: client.email,
                  phone: client.phone || undefined,
                  upworkProfileUrl: client.upwork_profile_url || undefined,
                  companyName: client.company_name || undefined,
                  companyWebsite: client.company_website || undefined,
                  notes: client.notes || undefined,
                  tags: client.tags || [],
                  createdAt: new Date(client.created_at),
                  updatedAt: new Date(client.updated_at || client.created_at)
                }}
                index={index}
                onEdit={() => handleEdit(client)}
                onDelete={() => handleDelete(client.id)}
                projectStats={getProjectStats(client.id)}
              />
            ))}
          </div>
        )}

        <ClientForm
          open={formOpen}
          onOpenChange={setFormOpen}
          client={editingClient}
          onSubmit={handleSubmit}
        />
      </div>
    </AppLayout>
  );
};

export default Clients;
