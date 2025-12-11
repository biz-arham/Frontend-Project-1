import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['hsl(var(--warning))', 'hsl(var(--primary))', 'hsl(var(--success))'];

interface ProjectStatusChartProps {
  projects?: any[];
}

export function ProjectStatusChart({ projects = [] }: ProjectStatusChartProps) {
  const statusCounts = {
    pending: projects.filter((p) => p.status === 'pending').length,
    ongoing: projects.filter((p) => p.status === 'ongoing').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  };
  
  const data = [
    { name: 'Pending', value: statusCounts.pending },
    { name: 'Ongoing', value: statusCounts.ongoing },
    { name: 'Completed', value: statusCounts.completed },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="glass-card rounded-xl border border-border p-6">
      <h3 className="mb-6 text-lg font-semibold text-foreground">Projects by Status</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
              {data.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
            <Legend formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
