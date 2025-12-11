import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar, DollarSign } from 'lucide-react';

const statusStyles = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  ongoing: 'bg-primary/20 text-primary border-primary/30',
  completed: 'bg-success/20 text-success border-success/30',
};

interface RecentProjectsProps {
  projects?: any[];
}

export function RecentProjects({ projects = [] }: RecentProjectsProps) {
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }} className="glass-card rounded-xl border border-border p-6">
      <h3 className="mb-6 text-lg font-semibold text-foreground">Recent Projects</h3>
      <div className="space-y-4">
        {recentProjects.map((project, index) => (
          <motion.div key={project.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 * index }} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className="font-medium text-foreground">{project.title}</h4>
                <Badge variant="outline" className={cn('text-xs', statusStyles[project.status as keyof typeof statusStyles])}>{project.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{project.clients?.full_name || 'Unknown Client'}</p>
            </div>
            <div className="flex items-center gap-6 text-right">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium text-foreground">${Number(project.price).toLocaleString()}</span>
              </div>
              {project.deadline && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(project.deadline), 'MMM d')}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {recentProjects.length === 0 && <p className="text-center text-muted-foreground py-8">No projects yet</p>}
      </div>
    </motion.div>
  );
}
