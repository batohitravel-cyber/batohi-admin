'use client';

import { useEffect, useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, PlusCircle, Search, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

type Place = {
  id: number;
  name: string;
  category: string;
  status: string;
  trending: boolean;
  unesco: boolean;
  must_visit: boolean;
  image_url: string;
  images: string[];
  updated_at: string;
};

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLabel, setFilterLabel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPlaces();

    // Set up Realtime subscription
    const channel = supabase
      .channel('realtime-places')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'places' },
        (payload) => {
          console.log('Realtime change received!', payload);
          // Simple strategy: re-fetch all places to ensure consistency
          // A more optimized approach would be to update the state locally based on payload
          fetchPlaces();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching places:', error);
      } else {
        setPlaces(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this place?')) return;

    const { error } = await supabase.from('places').delete().eq('id', id);
    if (error) {
      alert('Error deleting place: ' + error.message);
    }
    // Realtime subscription will handle the UI update
  };

  // Filter logic
  const filteredPlaces = places.filter(place => {
    // 1. Search Query
    if (searchQuery && !place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // 2. Category Filter
    if (filterCategory !== 'all' && place.category !== filterCategory) {
      return false;
    }
    // 3. Label Filter
    if (filterLabel !== 'all') {
      if (filterLabel === 'trending' && !place.trending) return false;
      if (filterLabel === 'unesco' && !place.unesco) return false;
      if (filterLabel === 'must-visit' && !place.must_visit) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Places & Attractions
          </h1>
          <p className="text-muted-foreground">
            Manage your places and attractions here.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/places/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Place
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Places</CardTitle>
          <CardDescription>
            A list of all the tourist places and attractions in your system.
          </CardDescription>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search places..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-1 items-center gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Historical Monument">Historical</SelectItem>
                  <SelectItem value="Museum">Museum</SelectItem>
                  <SelectItem value="Zoo">Zoo</SelectItem>
                  <SelectItem value="Religious">Religious</SelectItem>
                  <SelectItem value="Park">Park</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterLabel} onValueChange={setFilterLabel}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by Label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Labels</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="unesco">UNESCO</SelectItem>
                  <SelectItem value="must-visit">Must Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Labels</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Loading real-time data...
                  </TableCell>
                </TableRow>
              ) : filteredPlaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No places found. Add one to see it here!
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlaces.map((place) => (
                  <TableRow key={place.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={place.name}
                        className="aspect-square rounded-md object-cover"
                        height="40"
                        src={place.images?.[0] || place.image_url || 'https://picsum.photos/seed/default/40/40'}
                        width="40"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {place.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          place.status === 'Published'
                            ? 'default'
                            : place.status === 'Draft'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {place.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {place.category}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {place.trending && (
                          <Badge variant="outline">Trending</Badge>
                        )}
                        {place.unesco && (
                          <Badge className="bg-purple-600 text-white hover:bg-purple-700">UNESCO</Badge>
                        )}
                        {place.must_visit && (
                          <Badge className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Must Visit
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild><Link href={`/dashboard/places/edit/${place.id}`}>Edit</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href="/dashboard/places/alerts">Manage Alerts</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href="/dashboard/places/media">View Media</Link></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(place.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
