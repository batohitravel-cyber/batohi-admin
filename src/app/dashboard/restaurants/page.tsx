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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, PlusCircle, Search, Star, Loader2, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BulkImportDialog from '@/components/bulk-import/BulkImportDialog';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  // Fetch Data
  const fetchRestaurants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching restaurants:', error);
    } else {
      setRestaurants(data || []);
    }
    setLoading(false);
  };

  // Realtime Subscription
  useEffect(() => {
    fetchRestaurants();
    const channel = supabase
      .channel('realtime-restaurants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, () => {
        fetchRestaurants();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const confirmDelete = (id: string) => {
    setRestaurantToDelete(id);
    setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!restaurantToDelete) return;

    const { error } = await supabase.from('restaurants').delete().eq('id', restaurantToDelete);

    if (error) {
      alert(error.message);
    } else {
      fetchRestaurants(); // Refresh
    }

    setDeleteDialogOpen(false);
    setRestaurantToDelete(null);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
        />
      );
    }
    return <div className="flex items-center">{stars}</div>;
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Food & Restaurants</h1>
          <p className="text-muted-foreground">Manage your food and restaurants here.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRestaurants} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
          <BulkImportDialog configKey="restaurants" onSuccess={fetchRestaurants} />
          <Button asChild>
            <Link href="/dashboard/restaurants/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Restaurant
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Restaurants</CardTitle>
          <CardDescription>
            A list of all restaurants in the system.
          </CardDescription>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search restaurants..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  Image
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredRestaurants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">No restaurants found.</TableCell>
                </TableRow>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={restaurant.name}
                        className="aspect-square rounded-md object-cover"
                        height="40"
                        src={restaurant.images?.[0] || 'https://picsum.photos/seed/default/40/40'}
                        width="40"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{restaurant.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {renderStars(Number(restaurant.rating))}
                        <span className="text-xs text-muted-foreground">({restaurant.rating})</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{restaurant.price_category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell truncate max-w-[200px]">{restaurant.address}</TableCell>
                    <TableCell>
                      <Badge variant={restaurant.status === 'Published' ? 'default' : 'secondary'}>
                        {restaurant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={(e) => {
                            e.preventDefault();
                            setTimeout(() => {
                              setSelectedRestaurant(restaurant);
                              setViewDialogOpen(true);
                            }, 0);
                          }}>
                            <Eye className="mr-3 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/restaurants/edit/${restaurant.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => confirmDelete(restaurant.id)}>Delete</DropdownMenuItem>
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the restaurant from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={executeDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={viewDialogOpen} onOpenChange={(open) => {
        setViewDialogOpen(open);
        if (!open) window.location.reload();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Restaurant Details</DialogTitle>
            <DialogDescription>{selectedRestaurant?.name}</DialogDescription>
          </DialogHeader>
          {selectedRestaurant && (
            <div className="grid gap-4 py-4">
              {selectedRestaurant.images && selectedRestaurant.images.length > 0 && (
                <div className="relative h-48 w-full rounded-md overflow-hidden">
                  <Image
                    src={selectedRestaurant.images[0]}
                    alt={selectedRestaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground">Rating</h4>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span>{selectedRestaurant.rating}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Price Category</h4>
                  <Badge variant="outline">{selectedRestaurant.price_category}</Badge>
                </div>
                <div className="col-span-2">
                  <h4 className="font-semibold text-foreground">Address</h4>
                  <p className="text-muted-foreground">{selectedRestaurant.address}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="font-semibold text-foreground">Must Try Dishes</h4>
                  <p className="text-muted-foreground">
                    {selectedRestaurant.must_try_dishes && Array.isArray(selectedRestaurant.must_try_dishes)
                      ? selectedRestaurant.must_try_dishes.join(', ')
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
