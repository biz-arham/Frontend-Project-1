import { motion } from 'framer-motion';
import { Project } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, ExternalLink, MoreVertical, Pencil, Trash2, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format, isPast, differenceInDays } from 'date-fns';

export interface ProjectCardProps {
  project: Project;
  index: number;
  onEdit: (project: Project) => void;
  onDelete?: () => void;
  hideClient?: boolean;
  clientName?: string;
}

const statusStyles = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  ongoing: 'bg-primary/20 text-primary border-primary/30',
  completed: 'bg-success/20 text-success border-success/30',
};

export function ProjectCard({ project, index, onEdit, onDelete, hideClient, clientName }: ProjectCardProps) {
  const isOverdue = project.deadline && isPast(new Date(project.deadline)) && project.status !== 'completed';
  const daysUntilDeadline = project.deadline ? differenceInDays(new Date(project.deadline), new Date()) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className={cn('glass-card group rounded-xl border p-5 transition-all duration-300 hover:shadow-lg', isOverdue ? 'border-destructive/50 hover:border-destructive' : 'border-border hover:border-primary/50')}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
            <Badge variant="outline" className={cn('text-xs', statusStyles[project.status])}>{project.status}</Badge>
            {isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
          </div>
          
          {project.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>}
          
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            {!hideClient && clientName && <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /><span>{clientName}</span></div>}
            <div className="flex items-center gap-2 font-medium text-success"><DollarSign className="h-4 w-4" /><span>${project.price.toLocaleString()}</span></div>
            {project.deadline && (
              <div className={cn('flex items-center gap-2', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
                <Calendar className="h-4 w-4" /><span>{format(new Date(project.deadline), 'MMM d, yyyy')}</span>
                {daysUntilDeadline !== null && daysUntilDeadline > 0 && <span className="text-xs">({daysUntilDeadline}d left)</span>}
              </div>
            )}
          </div>
          
          {project.storeUrl && <a href={project.storeUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">View Store<ExternalLink className="h-3 w-3" /></a>}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="opacity-0 transition-opacity group-hover:opacity-100"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(project)}><Pencil className="mr-2 h-4 w-4" />Edit Project</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
