'use client';

import { useEffect, useState, useTransition } from 'react';
import StatCard from '@/components/dashboard/stat-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert,
  AlertTriangle,
  Hospital,
  PhoneCall,
  RefreshCw,
  CheckCircle2,
  MapPin,
  Trash2,
  Plus,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from "@/hooks/use-toast";
import {
  getSafetyStats,
  getSafetyAlerts,
  updateAlertStatus,
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact
} from '@/lib/server-actions';

interface Alert {
  id: string;
  user_name: string;
  phone: string;
  type: string;
  status: string;
  location?: string;
  address?: string;
  created_at: string;
  description?: string;
  user_details?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    phone_number?: string;
  } | null;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: string;
  location: string;
  is_active: boolean;
}

export default function SafetyPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState({ openAlerts: 0, inProgress: 0, activeHubs: 0, avgResponseTime: '--' });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // New Contact Form State
  const [newContact, setNewContact] = useState({ name: '', phone: '', type: 'Police', location: 'Bihar' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = async () => {
    startTransition(async () => {
      const [fetchedStats, fetchedAlerts, fetchedContacts] = await Promise.all([
        getSafetyStats(),
        getSafetyAlerts(),
        getEmergencyContacts()
      ]);

      setStats(fetchedStats);
      setAlerts(fetchedAlerts);
      setContacts(fetchedContacts);
      setLastUpdated(new Date());
    });
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id: string) => {
    const result = await updateAlertStatus(id, 'Resolved');
    if (result.success) {
      toast({ title: "Alert Resolved", description: "The safety alert has been marked as resolved." });
      fetchData();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) return;

    const result = await addEmergencyContact({ ...newContact, is_active: true });
    if (result.success) {
      setIsDialogOpen(false);
      setNewContact({ name: '', phone: '', type: 'Police', location: 'Bihar' });
      toast({ title: "Contact Added", description: `${newContact.name} has been added to emergency contacts.` });
      fetchData();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    const result = await deleteEmergencyContact(id);
    if (result.success) {
      toast({ title: "Contact Deleted", description: "The contact has been removed." });
      fetchData();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const handleDismiss = async (id: string) => {
    if (!confirm("Are you sure you want to dismiss this alert as a False Alarm?")) return;

    const result = await updateAlertStatus(id, 'False Alarm');
    if (result.success) {
      toast({ title: "Alert Dismissed", description: "The alert has been marked as a false alarm." });
      fetchData();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'destructive';
      case 'In Progress': return 'warning'; // Custom or default variant
      case 'Resolved': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Safety & Emergency Control</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of SOS alerts and emergency resource management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-2">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Alerts"
          value={stats.openAlerts.toString()}
          change="Requires Action"
          icon={ShieldAlert}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress.toString()}
          change="Being Handled"
          icon={AlertTriangle}
        />
        <StatCard
          title="Active Hubs"
          value={stats.activeHubs.toString()}
          change="Emergency Contacts"
          icon={Hospital}
        />
        <StatCard
          title="Avg. Response"
          value={stats.avgResponseTime}
          change="Last 24 Hours"
          icon={PhoneCall}
        />
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList>
          <TabsTrigger value="alerts">Live SOS Alerts</TabsTrigger>
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Live Distress Signals
              </CardTitle>
              <CardDescription>
                Priority alerts from users. Action required immediately for 'Open' status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>User / Phone</TableHead>
                    <TableHead>Problem / Details</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.length > 0 ? alerts.map((alert) => (
                    <TableRow key={alert.id} className="group hover:bg-muted/10 transition-colors">
                      <TableCell>
                        <Badge variant={alert.status === 'Open' ? 'destructive' : alert.status === 'Resolved' ? 'secondary' : 'default'} className="uppercase text-[10px] font-bold tracking-wide">
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                           {alert.user_details ? (
                               <Avatar className="h-9 w-9 border shadow-sm">
                                   <AvatarImage src={alert.user_details.avatar_url} alt={alert.user_details.full_name} />
                                   <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                       {alert.user_details.full_name?.slice(0, 2).toUpperCase() || 'U'}
                                   </AvatarFallback>
                               </Avatar>
                           ) : (
                               <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                                   <span className="text-xs font-bold text-muted-foreground">{alert.user_name?.slice(0, 1) || 'A'}</span>
                               </div>
                           )}
                           <div className="flex flex-col">
                             <span className="font-semibold text-sm text-foreground">
                                 {alert.user_details ? alert.user_details.full_name : (alert.user_name || 'Anonymous')}
                             </span>
                             <span className="text-xs text-muted-foreground">{alert.phone}</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit">{alert.type}</Badge>
                          <span className="text-sm truncate" title={alert.description}>
                            {alert.description || 'No additional details provided.'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {alert.address || 'Unknown Location'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Alert Details</DialogTitle>
                                <DialogDescription>
                                  Full information regarding the SOS signal.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-medium text-right">User:</span>
                                  <span className="col-span-3">{alert.user_name} ({alert.phone})</span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-medium text-right">Type:</span>
                                  <Badge className="w-fit col-span-3">{alert.type}</Badge>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-medium text-right">Status:</span>
                                  <span className="col-span-3">{alert.status}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                  <span className="font-medium text-right pt-1">Description:</span>
                                  <p className="col-span-3 text-sm text-muted-foreground bg-muted p-2 rounded-md">
                                    {alert.description || 'No description available.'}
                                  </p>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-medium text-right">Location:</span>
                                  <span className="col-span-3 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" /> {alert.address}
                                  </span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-medium text-right">Coords:</span>
                                  <span className="col-span-3 font-mono text-xs">
                                    {/* Mock or real coords if available in schema, not passed in alert type currently explicitly but usually in fetched object */}
                                    Lat: 25.611, Long: 85.144
                                  </span>
                                </div>
                              </div>
                              <DialogFooter className="gap-2 sm:gap-0">
                                {alert.status !== 'Resolved' && (
                                  <Button onClick={() => handleResolve(alert.id)} className="w-full sm:w-auto">
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Mark Resolved
                                  </Button>
                                )}
                                {alert.status !== 'False Alarm' && alert.status !== 'Resolved' && (
                                  <Button variant="destructive" onClick={() => handleDismiss(alert.id)} className="w-full sm:w-auto">
                                    Dismiss / False Alarm
                                  </Button>
                                )}
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {alert.status !== 'Resolved' && (
                            <Button variant="outline" size="sm" className="h-8 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleResolve(alert.id)}>
                              <CheckCircle2 className="h-3 w-3" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No active alerts found. System is secure.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Emergency Contacts Directory</CardTitle>
                <CardDescription>
                  Manage police, ambulance, and support numbers displayed to users.
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Contact</DialogTitle>
                    <DialogDescription>
                      Add a new emergency service number to the Batohi network.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input
                        id="name"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g. Patliputra Police Station"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Phone</Label>
                      <Input
                        id="phone"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g. 0612-2345678"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">Type</Label>
                      <Input
                        id="type"
                        value={newContact.type}
                        onChange={(e) => setNewContact({ ...newContact, type: e.target.value })}
                        className="col-span-3"
                        placeholder="Police, Medical, Fire..."
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location" className="text-right">Location</Label>
                      <Input
                        id="location"
                        value={newContact.location}
                        onChange={(e) => setNewContact({ ...newContact, location: e.target.value })}
                        className="col-span-3"
                        placeholder="Coverage Area"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddContact}>Save Contact</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{contact.type}</Badge>
                      </TableCell>
                      <TableCell>{contact.location}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
