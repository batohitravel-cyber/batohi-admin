'use client';

import { useState, useEffect } from 'react';
import { getVehicles, deleteVehicle } from '@/lib/vehicles-actions';
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
  Car,
  MapPin,
  IndianRupee,
  Fuel
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import BulkImportDialog from '@/components/bulk-import/BulkImportDialog';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog States
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState<any>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    const result = await getVehicles(page, 10, search);

    if (result.error) {
      toast({
        title: 'Error fetching vehicles',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setVehicles(result.vehicles || []);
      setTotalPages(result.totalPages);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, search]);

  const handleDeleteVehicle = async () => {
    if (!deletingVehicle) return;

    const result = await deleteVehicle(deletingVehicle.id);

    if (result.success) {
      toast({
        title: "Vehicle deleted successfully",
      });
      setConfirmDeleteOpen(false);
      setDeletingVehicle(null);
      fetchVehicles();
    } else {
      toast({
        title: "Error deleting vehicle",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Vehicle Fleet</h1>
          <p className="text-muted-foreground">Manage transportation options and availability.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchVehicles} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <BulkImportDialog configKey="vehicles" onSuccess={fetchVehicles} />
          <Link href="/dashboard/vehicles/add">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Vehicle
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>All Vehicles</CardTitle>
              <CardDescription>
                Showing {vehicles.length} results
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or reg. no..."
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
                <TableHead className="pl-6">Vehicle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Rate (₹/km)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">Loading...</TableCell>
                </TableRow>
              ) : vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No vehicles found.</TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="group hover:bg-muted/10 transition-colors">
                    <TableCell className="pl-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-md border bg-muted/50">
                          <Car className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{vehicle.vehicle_name}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model} ({vehicle.color})</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {vehicle.vehicle_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{vehicle.registration_number}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-muted-foreground">
                        <span>{vehicle.seating_capacity} Seats</span>
                        <span>{vehicle.fuel_type || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">
                        ₹{vehicle.price_per_km}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={vehicle.availability_status === 'available' ? 'default' : 'secondary'}
                        className={cn("uppercase text-[10px]",
                          vehicle.availability_status === 'available' ? 'bg-green-600 hover:bg-green-700' :
                            vehicle.availability_status === 'maintenance' ? 'bg-red-500 hover:bg-red-600' : ''
                        )}
                      >
                        {vehicle.availability_status || 'Unknown'}
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
                            <Link href={`/dashboard/vehicles/${vehicle.id}`}>Edit Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setDeletingVehicle(vehicle); setConfirmDeleteOpen(true); }} className="text-red-500">
                            Delete Vehicle
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
              This action cannot be undone. This will permanently delete the vehicle listing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteVehicle}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
