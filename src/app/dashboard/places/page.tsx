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
import { MoreHorizontal, PlusCircle, Search, Star, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import BulkImportDialog from '@/components/bulk-import/BulkImportDialog';

// Updated type to include story
type Place = {
  id: number;
  name: string;
  status: string;
  trending: boolean;
  unesco: boolean;
  must_visit: boolean;
  image_url: string;
  images: string[];
  updated_at: string;
  category_name: string | null;
  story: string | null;
  description: string | null;
  timings: string | null;
  ticket_price: string | null;
  distance_from_center: string | null;
  latitude: number | null;
  longitude: number | null;
  address: any | null; // JSONB
  ticket_pricing: any | null; // JSONB
};

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLabel, setFilterLabel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uniqueCategories, setUniqueCategories] = useState<{ name: string }[]>([]);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState<number | null>(null);

  // View Dialog State
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  useEffect(() => {
    fetchPlaces();
    fetchCategoriesForFilter();

    const channel = supabase
      .channel('realtime-places')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'places' },
        () => fetchPlaces()
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
        .select(`
          *,
          categories (name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching places:', error.message || error);
        return;
      }

      const mapped = data.map((place: any) => ({
        ...place,
        category_name: place.categories?.name || '—',
      }));

      setPlaces(mapped);
    } catch (err) {
      console.error('Unexpected fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesForFilter = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .eq('is_active', true)
      .order('name');

    if (!error) {
      setUniqueCategories(data || []);
    }
  };

  const confirmDelete = (id: number) => {
    setPlaceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!placeToDelete) return;

    const { error } = await supabase.from('places').delete().eq('id', placeToDelete);

    if (error) {
      alert('Error deleting place: ' + error.message);
    }

    setDeleteDialogOpen(false);
    setPlaceToDelete(null);
    fetchPlaces(); // Refresh list
  };

  const filteredPlaces = places.filter(place => {
    if (searchQuery && !place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterCategory !== 'all' && place.category_name !== filterCategory) {
      return false;
    }
    if (filterLabel !== 'all') {
      if (filterLabel === 'trending' && !place.trending) return false;
      if (filterLabel === 'unesco' && !place.unesco) return false;
      if (filterLabel === 'must-visit' && !place.must_visit) return false;
    }
    return true;
  });

  // Helper: truncate story to 50 chars
  const truncateStory = (story: string | null) => {
    if (!story) return '—';
    return story.length > 50 ? story.slice(0, 50) + '...' : story;
  };

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
        <div className="flex gap-2">
          <BulkImportDialog configKey="places" onSuccess={fetchPlaces} />
          <Button asChild>
            <Link href="/dashboard/places/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Place
            </Link>
          </Button>
        </div>
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
                onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex flex-1 items-center gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((cat, idx) => (
                    <SelectItem key={idx} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
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
                {/* 👇 NEW ADDRESS COLUMN (Replaces Story Preview) */}
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Loading real-time data...
                  </TableCell>
                </TableRow>
              ) : filteredPlaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
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
                        src={place.images?.[0] || place.image_url || `https://picsum.photos/seed/default/40/40`}
                        width="40" />
                    </TableCell>
                    <TableCell className="font-medium">
                      {place.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={place.status === 'Published'
                          ? 'default'
                          : place.status === 'Draft'
                            ? 'secondary'
                            : 'destructive'}
                      >
                        {place.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {place.category_name}
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
                    {/* 👇 ADDRESS DISPLAY */}
                    <TableCell className="hidden md:table-cell">
                      <span className="block max-w-[200px] truncate text-sm text-gray-600">
                        {place.address?.full || '—'}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {[place.address?.city, place.address?.state, place.address?.pincode].filter(Boolean).join(', ')}
                      </span>
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
                          <DropdownMenuItem onSelect={(e) => {
                            e.preventDefault();
                            setTimeout(() => {
                              setSelectedPlace(place);
                              setViewDialogOpen(true);
                            }, 0);
                          }}>
                            <Eye className="mr-3 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/places/edit/${place.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/places/alerts">Manage Alerts</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/places/media">View Media</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => confirmDelete(place.id)}>
                            Delete
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the place from the database.
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
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Place Details</DialogTitle>
            <DialogDescription>Detailed view of {selectedPlace?.name}</DialogDescription>
          </DialogHeader>
          {selectedPlace && (
            <ScrollArea className="flex-1 p-6">
              <div className="flex flex-col gap-6">
                {selectedPlace.image_url && (
                  <div className="relative h-64 w-full rounded-md overflow-hidden shadow-sm">
                    <Image
                      src={selectedPlace.image_url}
                      alt={selectedPlace.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  <div className="col-span-2 sm:col-span-1">
                    <h4 className="font-semibold text-sm text-foreground mb-1">Name</h4>
                    <p className="text-sm text-muted-foreground">{selectedPlace.name}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <h4 className="font-semibold text-sm text-foreground mb-1">Category</h4>
                    <p className="text-sm text-muted-foreground">{selectedPlace.category_name}</p>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <h4 className="font-semibold text-sm text-foreground mb-1">Status</h4>
                    <Badge variant={selectedPlace.status === 'Published' ? 'default' : 'secondary'}>
                      {selectedPlace.status}
                    </Badge>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <h4 className="font-semibold text-sm text-foreground mb-1">Labels</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlace.trending && <Badge variant="outline" className="text-xs">Trending</Badge>}
                      {selectedPlace.unesco && <Badge className="bg-purple-100 text-purple-700 text-xs hover:bg-purple-100">UNESCO</Badge>}
                      {selectedPlace.must_visit && <Badge className="bg-green-100 text-green-700 text-xs hover:bg-green-100">Must Visit</Badge>}
                      {!selectedPlace.trending && !selectedPlace.unesco && !selectedPlace.must_visit && <span className="text-sm text-muted-foreground">-</span>}
                    </div>
                  </div>

                  {selectedPlace.description && (
                    <div className="col-span-2">
                      <h4 className="font-semibold text-sm text-foreground mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedPlace.description}
                      </p>
                    </div>
                  )}

                  {selectedPlace.story && (
                    <div className="col-span-2">
                      <h4 className="font-semibold text-sm text-foreground mb-1">Story</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedPlace.story}
                      </p>
                    </div>
                  )}

                  <div className="col-span-2 border-t pt-4 mt-2">
                    <h4 className="font-semibold text-base text-foreground mb-3">Additional Information</h4>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <h4 className="font-semibold text-sm text-foreground mb-1">Timings</h4>
                    <p className="text-sm text-muted-foreground">{selectedPlace.timings || 'N/A'}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <h4 className="font-semibold text-sm text-foreground mb-1">Ticket Price</h4>
                    {selectedPlace.ticket_pricing ? (
                      <div className="text-sm text-muted-foreground space-y-1">
                        {selectedPlace.ticket_pricing.pricing_type === 'fixed' ? (
                          <span>Fixed: {selectedPlace.ticket_pricing.prices?.[0]?.price} {selectedPlace.ticket_pricing.currency}</span>
                        ) : (
                          <ul className="list-disc list-inside">
                            {selectedPlace.ticket_pricing.prices?.map((p: any, idx: number) => (
                              <li key={idx}>
                                {p.label}: {p.price} {selectedPlace.ticket_pricing.currency}
                                {p.age_range && <span className="text-xs ml-1">({p.age_range})</span>}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{selectedPlace.ticket_price || 'N/A'}</p>
                    )}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <h4 className="font-semibold text-sm text-foreground mb-1">Distance from Center</h4>
                    <p className="text-sm text-muted-foreground">{selectedPlace.distance_from_center || 'N/A'}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <h4 className="font-semibold text-sm text-foreground mb-1">Coordinates</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedPlace.latitude && selectedPlace.longitude
                        ? `${selectedPlace.latitude}, ${selectedPlace.longitude}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}