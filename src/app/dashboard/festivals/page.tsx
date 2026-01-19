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
import { Input } from '@/components/ui/input';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Loader2,
  X,
  MapPin,
  CalendarDays,
  Sparkles,
  PartyPopper
} from 'lucide-react';
import Link from 'next/link';
import { format, parseISO, isSameDay, isAfter, isBefore } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import BulkImportDialog from '@/components/bulk-import/BulkImportDialog';

export default function FestivalsListPage() {
  const [festivals, setFestivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);

  const fetchFestivals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('festivals')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) console.error(error);
    else setFestivals(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFestivals();
    const channel = supabase.channel('realtime-festivals-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'festivals' }, fetchFestivals)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this festival?")) return;
    await supabase.from('festivals').delete().eq('id', id);
  };

  const handleToggleFeatured = async (id: string, currentVal: boolean) => {
    await supabase.from('festivals').update({ is_featured: !currentVal }).eq('id', id);
  };

  const festivalDates = festivals.filter(f => f.start_date).map(f => parseISO(f.start_date));

  const filtered = festivals.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.location?.toLowerCase().includes(search.toLowerCase());
    const matchesDate = date ? (
      (f.start_date && isSameDay(parseISO(f.start_date), date)) ||
      (f.end_date && f.start_date && isAfter(date, parseISO(f.start_date)) && isBefore(date, parseISO(f.end_date)))
    ) : true;
    return matchesSearch && matchesDate;
  });

  // Stats
  const totalFestivals = festivals.length;
  const upcomingFestivals = festivals.filter(f => f.start_date && isAfter(parseISO(f.start_date), new Date())).length;
  const featuredFestivals = festivals.filter(f => f.is_featured).length;

  return (
    <div className="flex flex-col gap-8 h-full p-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Festivals & Events</h1>
          <p className="text-muted-foreground">Curate and manage cultural celebrations.</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkImportDialog configKey="festivals" onSuccess={fetchFestivals} />
          <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all">
            <Link href="/dashboard/festivals/add">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Festival
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Festivals</CardTitle>
            <PartyPopper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFestivals}</div>
            <p className="text-xs text-muted-foreground">All time events</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingFestivals}</div>
            <p className="text-xs text-muted-foreground">Scheduled for future dates</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredFestivals}</div>
            <p className="text-xs text-muted-foreground">Highlighted on app home</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Left: List Table */}
        <Card className="order-2 xl:order-1 border-none shadow-md bg-card">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Festival Directory</CardTitle>
                <CardDescription>Manage details, images, and schedules.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  className="pl-9 bg-background/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {date && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setDate(undefined)}
                    title="Clear date filter"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[80px] pl-6">Image</TableHead>
                  <TableHead>Festival Info</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      {date ? "No festivals found on this date." : "No festivals found. Add one to get started!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((festival) => (
                    <TableRow key={festival.id} className="group hover:bg-muted/10 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden shadow-sm border bg-muted">
                          <img
                            src={festival.images?.[0] || 'https://picsum.photos/seed/default/60/60'}
                            alt={festival.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-base">{festival.name}</span>
                            {festival.is_featured && <Sparkles className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{festival.location || 'Location N/A'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="font-medium text-foreground/90">
                            {festival.start_date ? format(parseISO(festival.start_date), 'MMM d, yyyy') : 'N/A'}
                          </span>
                          {festival.end_date && (
                            <span className="text-muted-foreground text-xs">
                              to {format(parseISO(festival.end_date), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={festival.status === 'Published' ? 'default' : 'secondary'}
                          className="px-2.5 py-0.5"
                        >
                          {festival.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Manage Festival</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/festivals/edit/${festival.id}`} className="cursor-pointer">
                                Edit Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFeatured(festival.id, festival.is_featured)}>
                              {festival.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => handleDelete(festival.id)}>
                              Delete Event
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

        {/* Right: Calendar & Info */}
        <div className="flex flex-col gap-6 order-1 xl:order-2 sticky top-6">
          <Card className="border-none shadow-md overflow-hidden bg-card">
            <CardHeader className="bg-primary/5 pb-4 border-b">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Calendar Filter
              </CardTitle>
              <CardDescription>Select a date to filter the list.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex justify-center bg-background">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border p-3 shadow-sm"
                modifiers={{
                  booked: festivalDates
                }}
                modifiersClassNames={{
                  booked: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full font-bold text-primary"
                }}
              />
            </CardContent>
          </Card>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Pro Tip</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Featured festivals appear on the main user dashboard. Use the actions menu to toggle status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
