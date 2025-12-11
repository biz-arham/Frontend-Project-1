import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ProjectStatusChart } from '@/components/dashboard/ProjectStatusChart';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, FolderKanban, DollarSign, AlertCircle } from 'lucide-react';
import { isPast } from 'date-fns';

const Index = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const [clientsRes, projectsRes] = await Promise.all([
      supabase.from('clients').select('*').eq('user_id', user?.id),
      supabase.from('projects').select('*, clients(full_name)').eq('user_id', user?.id)
    ]);
    
    setClients(clientsRes.data || []);
    setProjects(projectsRes.data || []);
    setLoading(false);
  };
  
  const totalRevenue = projects.reduce((sum, p) => sum + Number(p.price), 0);
  const ongoingRevenue = projects
    .filter((p) => p.status === 'ongoing')
    .reduce((sum, p) => sum + Number(p.price), 0);
  const pendingDeadlines = projects.filter(
    (p) => p.deadline && isPast(new Date(p.deadline)) && p.status !== 'completed'
  ).length;
  const ongoingCount = projects.filter((p) => p.status === 'ongoing').length;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back! Here's an overview of your client management.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Clients"
            value={loading ? '...' : clients.length}
            icon={Users}
            variant="primary"
            delay={0}
          />
          <StatCard
            title="Total Projects"
            value={loading ? '...' : projects.length}
            icon={FolderKanban}
            variant="accent"
            subtitle={`${ongoingCount} ongoing`}
            delay={0.1}
          />
          <StatCard
            title="Total Revenue"
            value={loading ? '...' : `$${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            variant="success"
            subtitle={`$${ongoingRevenue.toLocaleString()} in progress`}
            delay={0.2}
          />
          <StatCard
            title="Pending Deadlines"
            value={loading ? '...' : pendingDeadlines}
            icon={AlertCircle}
            variant={pendingDeadlines > 0 ? 'warning' : 'default'}
            subtitle={pendingDeadlines > 0 ? 'Requires attention' : 'All on track'}
            delay={0.3}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart clients={clients} projects={projects} />
          <ProjectStatusChart projects={projects} />
        </div>

        <RecentProjects projects={projects} />
      </div>
    </AppLayout>
  );
};

export default Index;
