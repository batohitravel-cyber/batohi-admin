'use client';

import { useState, useEffect } from 'react';
import { getDrivers, deleteDriver } from '@/lib/vehicles-actions';
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
import {
  MoreHorizontal,
  Search,
  PlusCircle,
  RefreshCw,
  User,
  Phone,
  Car
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog States
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingDriver, setDeletingDriver] = useState<any>(null);

  const fetchDrivers = async () => {
    setLoading(true);
    const result = await getDrivers(page, 10, search);
    
    if (result.error) {
      toast({
        title: 'Error fetching drivers',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setDrivers(result.drivers || []);
      setTotalPages(result.totalPages);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, search]); 

  const handleDeleteDriver = async () => {
    if (!deletingDriver) return;
    
    const result = await deleteDriver(deletingDriver.id);
    
    if (result.success) {
      toast({
        title: "Driver deleted successfully",
      });
      setConfirmDeleteOpen(false);
      setDeletingDriver(null);
      fetchDrivers();
    } else {
      toast({
        title: "Error deleting driver",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Drivers</h1>
          <p className="text-muted-foreground">Manage drivers and assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchDrivers} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Link href="/dashboard/vehicles/drivers/add">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4"/>
              Add Driver
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>All Drivers</CardTitle>
              <CardDescription>
                Showing {drivers.length} results
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or phone..."
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
                <TableHead className="pl-6">Driver Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>License No.</TableHead>
                <TableHead>Vehicle Assigned</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">Loading...</TableCell>
                </TableRow>
              ) : drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No drivers found.</TableCell>
                </TableRow>
              ) : (
                drivers.map((driver) => (
                  <TableRow key={driver.id} className="group hover:bg-muted/10 transition-colors">
                    <TableCell className="pl-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{driver.driver_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{driver.phone_number}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                        <span className="font-mono text-xs">{driver.license_number}</span>
                    </TableCell>
                    <TableCell>
                        {driver.vehicles ? (
                            <div className="flex flex-col text-xs">
                                <span className="font-medium">{driver.vehicles.vehicle_name}</span>
                                <span className="text-muted-foreground">{driver.vehicles.registration_number}</span>
                            </div>
                        ) : (
                            <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                    </TableCell>
                    <TableCell>
                        {driver.years_of_experience} years
                    </TableCell>
                    <TableCell>
                        {driver.rating} ★
                    </TableCell>
                    <TableCell>
                      <Badge variant={driver.is_verified ? 'default' : 'secondary'}>
                        {driver.is_verified ? 'Yes' : 'No'}
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
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                             <Link href={`/dashboard/vehicles/drivers/${driver.id}`}>Edit Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <DropdownMenuItem onClick={() => { setDeletingDriver(driver); setConfirmDeleteOpen(true); }} className="text-red-500">
                            Delete Driver
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

      <Dialog open={isConfirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                  This action cannot be undone. This will permanently delete the driver profile.
              </DialogDescription>
          </DialogHeader>
          <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteDriver}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
