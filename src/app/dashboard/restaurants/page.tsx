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
import { MoreHorizontal, PlusCircle, Search, Star, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;
    const { error } = await supabase.from('restaurants').delete().eq('id', id);
    if (error) alert(error.message);
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
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/restaurants/edit/${restaurant.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(restaurant.id)}>Delete</DropdownMenuItem>
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
    </div>
  );
}
