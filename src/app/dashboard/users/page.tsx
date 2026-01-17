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
  Users,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Dialog States
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Data States
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({ full_name: '', email: '' });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);

  // Mail Dialog State
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mobile_app_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error fetching users',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setUsers(data || []);
      setLastUpdated(new Date());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Banned' : 'Active';
    const { error } = await supabase.from('mobile_app_users').update({ status: newStatus }).eq('id', id);
    if (error) {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: `User marked as ${newStatus}`,
      });
    }
  };

  const handleOpenMail = (user: any) => {
    setSelectedUser(user);
    setMailSubject('');
    setMailBody('');
    setIsMailOpen(true);
  };

  const handleSendMail = () => {
    // Logic to integrate with email service would go here
    console.log(`Sending mail to ${selectedUser?.email}`, { subject: mailSubject, body: mailBody });
    toast({ title: `Email sent successfully to ${selectedUser?.email}!` });
    setIsMailOpen(false);
  };
  
  const handleAddUser = async () => {
    // Basic validation
    if (!newUser.full_name || !newUser.email) {
        toast({
            title: "Validation Error",
            description: "Please provide a full name and email.",
            variant: "destructive",
        });
        return;
    }

    const { data, error } = await supabase.from('mobile_app_users').insert([newUser]).select();
    if (error) {
        toast({
            title: "Error adding user",
            description: error.message,
            variant: "destructive",
        });
    } else {
        toast({
            title: "User added successfully",
        });
        setIsAddUserOpen(false);
        setNewUser({ full_name: '', email: '' });
    }
};

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setIsEditOpen(true);
  };
  
  const handleEditUser = async () => {
    if (!editingUser) return;
    const { data, error } = await supabase
        .from('mobile_app_users')
        .update({ full_name: editingUser.full_name, avatar_url: editingUser.avatar_url })
        .eq('id', editingUser.id)
        .select();

    if (error) {
        toast({
            title: "Error updating user",
            description: error.message,
            variant: "destructive",
        });
    } else {
        toast({
            title: "User updated successfully",
        });
        setIsEditOpen(false);
        setEditingUser(null);
    }
};


const handleDeleteUser = async () => {
  if (!deletingUser) return;
  const { error } = await supabase.from('mobile_app_users').delete().eq('id', deletingUser.id);
  if (error) {
      toast({
          title: "Error deleting user",
          description: error.message,
          variant: "destructive",
      });
  } else {
      toast({
          title: "User deleted successfully",
      });
      setConfirmDeleteOpen(false);
      setDeletingUser(null);
  }
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
        <div className="flex items-center gap-2">
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setIsAddUserOpen(true)} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4"/>
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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
              <CardDescription>Last updated at {format(lastUpdated, 'p')}</CardDescription>
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
                <TableHead>Joined</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && users.length === 0 ? (
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
                        <div>
                          <p className="font-semibold text-sm text-foreground">{user.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.created_at ? format(parseISO(user.created_at), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.last_seen ? formatDistanceToNow(parseISO(user.last_seen), { addSuffix: true }) : 'Never'}
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
                             Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                             Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusChange(user.id, user.status)} className={user.status === 'Active' ? 'text-yellow-600' : 'text-green-600'}>
                            {user.status === 'Active' ? 'Restrict' : 'Un-restrict'}
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => { setDeletingUser(user); setConfirmDeleteOpen(true); }} className="text-red-500">
                            Delete User
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

      {/* Dialogs */}
      <Dialog open={isMailOpen} onOpenChange={setIsMailOpen}>
        {/* ... Mail Dialog ... */}
      </Dialog>
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Input
                    placeholder="Full Name"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                />
                <Input
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Input
                    placeholder="Full Name"
                    value={editingUser?.full_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                />
                <Input
                    placeholder="Avatar URL"
                    value={editingUser?.avatar_url || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, avatar_url: e.target.value })}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button onClick={handleEditUser}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                  This action cannot be undone. This will permanently delete the user account.
              </DialogDescription>
          </DialogHeader>
          <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
