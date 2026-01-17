'use client';

import { useState, useEffect } from 'react';
import { getHotels, deleteHotel } from '@/lib/hotels-actions';
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
    Building2,
    MapPin,
    Star,
    DollarSign
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';

export default function HotelsPage() {
    const [hotels, setHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { toast } = useToast();

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Dialog States
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deletingHotel, setDeletingHotel] = useState<any>(null);

    const fetchHotels = async () => {
        setLoading(true);
        const result = await getHotels(page, 10, search);

        if (result.error) {
            toast({
                title: 'Error fetching hotels',
                description: result.error,
                variant: 'destructive',
            });
        } else {
            setHotels(result.hotels || []);
            setTotalPages(result.totalPages);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHotels();
    }, [page, search]); // Re-fetch when page or search changes

    const handleDeleteHotel = async () => {
        if (!deletingHotel) return;

        const result = await deleteHotel(deletingHotel.id);

        if (result.success) {
            toast({
                title: "Hotel deleted successfully",
            });
            setConfirmDeleteOpen(false);
            setDeletingHotel(null);
            fetchHotels();
        } else {
            toast({
                title: "Error deleting hotel",
                description: result.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-col gap-8 h-full p-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Hotels</h1>
                    <p className="text-muted-foreground">Manage hotel listings and availability.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={fetchHotels} variant="outline" size="sm">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Link href="/dashboard/hotels/add">
                        <Button className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Add Hotel
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="border-none shadow-md">
                <CardHeader className="border-b bg-muted/20 pb-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Hotel Directory</CardTitle>
                            <CardDescription>
                                Showing {hotels.length} results
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search hotels..."
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
                                <TableHead className="pl-6">Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && hotels.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">Loading...</TableCell>
                                </TableRow>
                            ) : hotels.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No hotels found.</TableCell>
                                </TableRow>
                            ) : (
                                hotels.map((hotel) => (
                                    <TableRow key={hotel.id} className="group hover:bg-muted/10 transition-colors">
                                        <TableCell className="pl-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 relative overflow-hidden rounded-md border bg-muted">
                                                    {hotel.images && hotel.images[0] ? (
                                                        <Image
                                                            src={hotel.images[0]}
                                                            alt={hotel.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <Building2 className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-foreground">{hotel.name}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">{hotel.hotel_type || 'Hotel'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="truncate max-w-[150px]">{hotel.city || hotel.address || 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                                <span className="text-sm font-medium">{hotel.star_rating || '-'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>{hotel.price_per_night}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={hotel.status === 'Published' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                                                {hotel.status || 'Draft'}
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
                                                        <Link href={`/dashboard/hotels/${hotel.id}`}>Edit Details</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => { setDeletingHotel(hotel); setConfirmDeleteOpen(true); }} className="text-red-500">
                                                        Delete Hotel
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
                            This action cannot be undone. This will permanently delete the hotel listing.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteHotel}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
