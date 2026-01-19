'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import StatCard from '@/components/dashboard/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  UserPlus,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  ShieldCheck,                                                      
  Download,
  Activity,
  Eye
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminsDashboardPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);

  const fetchAdmins = async () => {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('id', { ascending: true }); // Ordering by ID or creation time
    if (error) console.error('Error fetching admins:', error);
    else setAdmins(data || []);
  };

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('admin_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) console.error('Error fetching logs:', error);
    else setLogs(data || []);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAdmins(), fetchLogs()]).finally(() => setLoading(false));

    const adminChannel = supabase.channel('realtime-admins-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admins' }, fetchAdmins)
      .subscribe();

    const logChannel = supabase.channel('realtime-logs-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_activity_logs' }, fetchLogs)
      .subscribe();

    return () => {
      supabase.removeChannel(adminChannel);
      supabase.removeChannel(logChannel);
    };
  }, []);

  const downloadLogsCSV = () => {
    const headers = ['Action', 'Admin', 'Details', 'IP Address', 'Time'];
    const rows = logs.map(log => [
      log.action,
      log.admin_name || 'Unknown',
      log.details || '',
      log.ip_address || '',
      format(parseISO(log.created_at), 'yyyy-MM-dd HH:mm:ss')
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "admin_activity_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats
  const totalAdmins = admins.length;
  const activeAdmins = admins.filter(a => a.status === 'Active').length;
  const invitedAdmins = admins.filter(a => a.status === 'Invited').length;

  return (
    <div className="flex flex-col gap-8 h-full p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Centralized control for administrators, roles, and system logs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadLogsCSV}>
            <Download className="mr-2 h-4 w-4" /> Export Logs
          </Button>
          <Button asChild className="bg-primary">
            <Link href="/dashboard/admins/add">
              <UserPlus className="mr-2 h-4 w-4" /> Add New Admin
            </Link>
          </Button>
        </div>
      </div>

      <StatsSection total={totalAdmins} active={activeAdmins} invited={invitedAdmins} />

      <Tabs defaultValue="admins" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="admins">Admin List</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="deactivated">Deactivated</TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>All users with admin privileges.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminTable
                admins={admins.filter(a => a.status !== 'Deactivated')}
                loading={loading}
                onViewDetails={setSelectedAdmin}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Recent actions performed by administrators.</CardDescription>
            </CardHeader>
            <CardContent>
              <LogsTable logs={logs} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deactivated" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Deactivated Accounts</CardTitle>
              <CardDescription>Former administrators or disabled accounts.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminTable
                admins={admins.filter(a => a.status === 'Deactivated')}
                loading={loading}
                onViewDetails={setSelectedAdmin}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedAdmin} onOpenChange={(open) => {
        if (!open) {
          setSelectedAdmin(null);
          window.location.reload();
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Admin Profile</DialogTitle>
            <DialogDescription>Detailed view of administrator ID: {selectedAdmin?.id}</DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-2 mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedAdmin.avatar_url} />
                  <AvatarFallback className="text-xl">{selectedAdmin.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-xl">{selectedAdmin.full_name}</h3>
                <Badge>{selectedAdmin.role}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{selectedAdmin.email}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Status</span>
                  <span className={selectedAdmin.status === 'Active' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                    {selectedAdmin.status}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Last Login</span>
                  <span>{selectedAdmin.last_login ? format(parseISO(selectedAdmin.last_login), 'PPpp') : 'Never'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Joined</span>
                  <span>{format(parseISO(selectedAdmin.created_at), 'PP')}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminTable({ admins, loading, onViewDetails }: { admins: any[], loading: boolean, onViewDetails: (a: any) => void }) {
  if (loading) return <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (admins.length === 0) return <div className="py-10 text-center text-muted-foreground">No admins found.</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Admin Profile</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admins.map((admin) => (
          <TableRow key={admin.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={admin.avatar_url} />
                  <AvatarFallback>{admin.full_name?.slice(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{admin.full_name}</span>
                  <span className="text-xs text-muted-foreground">{admin.email}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{admin.role}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={admin.status === 'Active' ? 'default' : 'secondary'} className={admin.status === 'Active' ? 'bg-green-600 hover:bg-green-700' : ''}>
                {admin.status}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {admin.last_login ? formatDistanceToNow(parseISO(admin.last_login), { addSuffix: true }) : 'Never'}
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onViewDetails(admin)}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View Details</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function LogsTable({ logs, loading }: { logs: any[], loading: boolean }) {
  if (loading) return <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (logs.length === 0) return <div className="py-10 text-center text-muted-foreground">No logs found.</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Action</TableHead>
          <TableHead>Admin</TableHead>
          <TableHead>Details</TableHead>
          <TableHead className="text-right">Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-muted-foreground" />
                {log.action}
              </div>
            </TableCell>
            <TableCell>{log.admin_name || 'Unknown'}</TableCell>
            <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate" title={log.details}>
              {log.details || '-'}
            </TableCell>
            <TableCell className="text-right text-xs text-muted-foreground">
              {format(parseISO(log.created_at), 'MMM d, HH:mm')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function StatsSection({ total, active, invited }: { total: number, active: number, invited: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard title="Total Admins" value={total.toString()} change="Registered accounts" icon={Users} />
      <StatCard title="Active Accounts" value={active.toString()} change="Enabled accounts" icon={ShieldCheck} />
      <StatCard title="Invites Pending" value={invited.toString()} change="Unclaimed accounts" icon={UserPlus} />
      <StatCard title="Avg Session" value="12m" change="Metric placeholder" icon={Clock} />
    </div>
  );
}
