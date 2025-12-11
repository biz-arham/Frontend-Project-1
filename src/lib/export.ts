import { format } from 'date-fns';

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  company_website: string | null;
  tags: string[];
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  price: number;
  deadline: string | null;
  status: string;
  store_url: string | null;
  created_at: string;
  client_name?: string;
}

export const exportToCSV = (data: Client[] | Project[], type: 'clients' | 'projects') => {
  let csv = '';
  
  if (type === 'clients') {
    csv = 'Name,Email,Phone,Company,Website,Tags,Created\n';
    (data as Client[]).forEach(item => {
      csv += `"${item.full_name}","${item.email}","${item.phone || ''}","${item.company_name || ''}","${item.company_website || ''}","${item.tags.join(', ')}","${format(new Date(item.created_at), 'yyyy-MM-dd')}"\n`;
    });
  } else {
    csv = 'Title,Client,Price,Status,Deadline,Created\n';
    (data as Project[]).forEach(item => {
      csv += `"${item.title}","${item.client_name || ''}","${item.price}","${item.status}","${item.deadline ? format(new Date(item.deadline), 'yyyy-MM-dd') : ''}","${format(new Date(item.created_at), 'yyyy-MM-dd')}"\n`;
    });
  }

  downloadFile(csv, `${type}-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
};

export const exportToPDF = async (clients: Client[], projects: Project[], stats: {
  totalClients: number;
  totalProjects: number;
  totalRevenue: number;
  pendingProjects: number;
  ongoingProjects: number;
  completedProjects: number;
}) => {
  const content = `
CLIENT MANAGEMENT REPORT
Generated: ${format(new Date(), 'MMMM d, yyyy')}

================================================================================
SUMMARY
================================================================================
Total Clients: ${stats.totalClients}
Total Projects: ${stats.totalProjects}
Total Revenue: $${stats.totalRevenue.toLocaleString()}
Pending Projects: ${stats.pendingProjects}
Ongoing Projects: ${stats.ongoingProjects}
Completed Projects: ${stats.completedProjects}

================================================================================
CLIENTS (${clients.length})
================================================================================
${clients.map(c => `
• ${c.full_name}
  Email: ${c.email}
  Company: ${c.company_name || 'N/A'}
  Tags: ${c.tags.join(', ') || 'None'}
  Since: ${format(new Date(c.created_at), 'MMM yyyy')}
`).join('')}

================================================================================
PROJECTS (${projects.length})
================================================================================
${projects.map(p => `
• ${p.title}
  Client: ${p.client_name || 'N/A'}
  Price: $${Number(p.price).toLocaleString()}
  Status: ${p.status.toUpperCase()}
  Deadline: ${p.deadline ? format(new Date(p.deadline), 'MMM d, yyyy') : 'N/A'}
`).join('')}
`;

  downloadFile(content, `report-${format(new Date(), 'yyyy-MM-dd')}.txt`, 'text/plain');
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
