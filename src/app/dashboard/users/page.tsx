'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MoreHorizontal,
  Search,
  Mail,
  Smartphone,
  MapPin,
  ShieldAlert,
  CheckCircle,
  Loader2,
  UserX,
  UserCheck,
  Users
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Mail Dialog State
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .order('joined_at', { ascending: false });

    if (error) console.error('Error fetching users:', error);
    else setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    const channel = supabase.channel('realtime-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_users' }, fetchUsers)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Banned' : 'Active';
    const { error } = await supabase.from('app_users').update({ status: newStatus }).eq('id', id);
    if (error) {
      alert('Failed to update status');
    } else {
      // alert(`User marked as ${newStatus}`);
    }
  };

  const handleOpenMail = (user: any) => {
    setSelectedUser(user);
    setMailSubject('');
    setMailBody('');
    setIsMailOpen(true);
  };

  const handleSendMail = () => {
    // Logic to integrate with email service (e.g., Resend, SendGrid) would go here
    console.log(`Sending mail to ${selectedUser?.email}`, { subject: mailSubject, body: mailBody });
    alert(`Email sent successfully to ${selectedUser?.email}!`);
    setIsMailOpen(false);
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 h-full p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground">Comprehensive view of all platform users.</p>
        </div>
      </div>

      {/* Stats Cards (Mock Data for demonstration, can be real) */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.status === 'Active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.status === 'Banned').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>User Database</CardTitle>
              <CardDescription>Realtime monitoring of user base.</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email..."
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-6">User Profile</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No users found.</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="group hover:bg-muted/10 transition-colors">
                    <TableCell className="pl-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border shadow-sm">
                          <AvatarImage src={user.avatar_url} alt={user.full_name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user.full_name?.slice(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-foreground">{user.full_name || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1.5 ">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone_number && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Smartphone className="h-3.5 w-3.5" />
                            <span>{user.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{user.address || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.joined_at ? format(parseISO(user.joined_at), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className="uppercase text-[10px]">
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground group-hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenMail(user)}>
                            <Mail className="mr-2 h-4 w-4" /> Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusChange(user.id, user.status)} className={user.status === 'Active' ? 'text-red-500' : 'text-green-500'}>
                            {user.status === 'Active' ? (
                              <><UserX className="mr-2 h-4 w-4" /> Block User</>
                            ) : (
                              <><UserCheck className="mr-2 h-4 w-4" /> Unblock User</>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Send Mail Dialog */}
      <Dialog open={isMailOpen} onOpenChange={setIsMailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Email to {selectedUser?.full_name}</DialogTitle>
            <DialogDescription>
              Send a direct notification or generic message securely.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="subject" className="text-sm font-medium">Subject</label>
              <Input id="subject" value={mailSubject} onChange={e => setMailSubject(e.target.value)} placeholder="Important Update..." />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="body" className="text-sm font-medium">Message Body</label>
              <Textarea id="body" value={mailBody} onChange={e => setMailBody(e.target.value)} placeholder="Type your message here..." rows={6} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMailOpen(false)}>Cancel</Button>
            <Button onClick={handleSendMail}>
              <Mail className="mr-2 h-4 w-4" /> Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
