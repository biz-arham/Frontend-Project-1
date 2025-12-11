import { motion } from 'framer-motion';
import { Client } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Globe, ExternalLink, MoreVertical, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { tagColors } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ClientCardProps {
  client: Client;
  index: number;
  onEdit: (client: Client) => void;
  onDelete?: () => void;
  projectStats?: { count: number; ongoing: number; revenue: number };
}

export function ClientCard({ client, index, onEdit, onDelete, projectStats }: ClientCardProps) {
  const navigate = useNavigate();
  const stats = projectStats || { count: 0, ongoing: 0, revenue: 0 };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="glass-card group rounded-xl border border-border p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-foreground">
              {client.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{client.fullName}</h3>
              <p className="text-sm text-muted-foreground">{client.companyName}</p>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-1.5">
            {client.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className={cn('text-xs', tagColors[tag] || 'bg-muted text-muted-foreground')}>{tag}</Badge>
            ))}
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /><span className="truncate">{client.email}</span></div>
            {client.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /><span>{client.phone}</span></div>}
            {client.companyWebsite && <a href={client.companyWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline"><Globe className="h-4 w-4" /><span className="truncate">Website</span><ExternalLink className="h-3 w-3" /></a>}
          </div>
          
          <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
            <div><p className="text-xs text-muted-foreground">Projects</p><p className="text-lg font-semibold text-foreground">{stats.count}</p></div>
            <div><p className="text-xs text-muted-foreground">Ongoing</p><p className="text-lg font-semibold text-primary">{stats.ongoing}</p></div>
            <div><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-lg font-semibold text-success">${stats.revenue.toLocaleString()}</p></div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="opacity-0 transition-opacity group-hover:opacity-100"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}><FolderOpen className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(client)}><Pencil className="mr-2 h-4 w-4" />Edit Client</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete Client</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
