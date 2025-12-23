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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, PlusCircle, Search, Play, Pause, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type AudioStory = {
  id: string;
  title: string;
  language: string;
  status: string;
  audio_url: string;
  place_id: number | null;
  place: {
    id: number;
    name: string;
    image_url: string | null;
    images: string[] | null;
  } | null;
  created_at: string;
};


export default function AudioStoriesPage() {
  const [stories, setStories] = useState<AudioStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');

  useEffect(() => {
    fetchStories();

    // Realtime Subscription
    const channel = supabase
      .channel('realtime-audio-stories')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'audio_stories' },
        (payload) => {
          console.log('Realtime change:', payload);
          fetchStories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      // Try fetching with the relation first
      const { data, error } = await supabase
        .from('audio_stories')
        .select(`
    id,
    title,
    language,
    status,
    audio_url,
    created_at,
    place_id,
    place:places (
      id,
      name,
      images
    )
  `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stories with relation:', JSON.stringify(error, null, 2));

        // Fallback: Fetch without 'places' relation to debug/show partial data
        console.warn('Attempting fallback fetch (no relations)...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('audio_stories')
          .select('*')
          .order('created_at', { ascending: false });

        if (fallbackError) {
          console.error('Fallback fetch error:', JSON.stringify(fallbackError, null, 2));
          const msg = fallbackError.message || 'Unknown error';
          if (msg.includes('Failed to fetch') || msg.includes('Network request failed')) {
            alert("Connection Error: Could not reach Supabase. \n\n1. Check your internet connection.\n2. Verify your Supabase project is NOT paused in the dashboard.\n3. Check if AdBlock is interfering.");
          } else {
            alert(`Database Error: ${msg}. \n\nEnsure you have run the SQL schema to create the 'audio_stories' table.`);
          }
        } else {
          setStories((fallbackData as any[]) || []);
        }
      } else {
        setStories((data as any[]) || []);
      }
    } catch (err: any) {
      console.error("Unexpected error:", err);
      alert("Unexpected error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (story: AudioStory) => {
    if (playingId === story.id) {
      audio?.pause();
      setPlayingId(null);
    } else {
      if (audio) audio.pause();
      const newAudio = new Audio(story.audio_url);
      newAudio.play();
      newAudio.onended = () => setPlayingId(null);
      setAudio(newAudio);
      setPlayingId(story.id);

      // Optionally update play count in DB here
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    const { error } = await supabase.from('audio_stories').delete().eq('id', id);
    if (error) alert(error.message);
  };

  // Filter Logic
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.place?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = languageFilter === 'all' || story.language.toLowerCase() === languageFilter.toLowerCase();

    return matchesSearch && matchesLang;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audio Stories</h1>
          <p className="text-muted-foreground">
            Manage your cultural audio content here.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchStories()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh List'}
          </Button>
          <Button asChild>
            <Link href="/dashboard/audio/upload">
              <PlusCircle className="mr-2 h-4 w-4" /> Upload New Story
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Stories</CardTitle>
          <CardDescription>
            A list of all audio stories in the system.
          </CardDescription>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-1 items-center gap-2">
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="bhojpuri">Bhojpuri</SelectItem>
                  <SelectItem value="maithili">Maithili</SelectItem>
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
                <TableHead>Title</TableHead>
                <TableHead>Place</TableHead>
                <TableHead>Language</TableHead>
                <TableHead className="hidden md:table-cell">Review</TableHead>
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
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading stories...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No stories found. Create one to get started!
                  </TableCell>
                </TableRow>
              ) : (
                filteredStories.map((story) => {
                  // Safe access to places data (handles object vs array return from Supabase)
                  const placeData = Array.isArray(story.place) ? story.place[0] : story.place;
                  const placeName = placeData?.name || 'Unlinked';
                  const placeImage = placeData?.images?.[0] || placeData?.image_url || 'https://picsum.photos/seed/default/40/40';

                  return (
                    <TableRow key={story.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt={story.title}
                          className="aspect-square rounded-md object-cover"
                          height="40"
                          src={placeImage}
                          width="40"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {story.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{placeName}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{story.language}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Button
                          size="sm"
                          variant={playingId === story.id ? "default" : "outline"}
                          className="h-8 gap-2"
                          onClick={() => togglePlay(story)}
                        >
                          {playingId === story.id ? (
                            <><Pause className="h-3 w-3" /> Pause</>
                          ) : (
                            <><Play className="h-3 w-3" /> Play</>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant={story.status === 'Published' ? 'default' : 'secondary'}>
                          {story.status}
                        </Badge>
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
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/audio/edit/${story.id}`}>
                                Edit Story
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(story.id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                }))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
