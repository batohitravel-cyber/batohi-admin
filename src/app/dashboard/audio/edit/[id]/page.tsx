'use client';

import { useState, useEffect, use } from 'react'; // Added 'use'
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { generateAndUploadAudio, updateAudioStoryInDB } from '../../actions'; // Ensure correct import path
import { Loader2, PlayCircle, UploadCloud } from 'lucide-react';

export default function EditAudioStoryPage({ params }: { params: Promise<{ id: string }> }) {
  // Use React.use() to unwrap params
  const { id } = use(params);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('en');
  const [placeId, setPlaceId] = useState('');
  const [script, setScript] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Data State
  const [places, setPlaces] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      // 1. Fetch Places
      const { data: placesData } = await supabase.from('places').select('id, name');
      if (placesData) setPlaces(placesData);

      // 2. Fetch Existing Story
      const { data: story, error } = await supabase
        .from('audio_stories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        alert('Error fetching story: ' + error.message);
        router.push('/dashboard/audio');
        return;
      }

      if (story) {
        setTitle(story.title);
        setDescription(story.description || '');
        setLanguage(story.language);
        setPlaceId(story.place_id ? story.place_id.toString() : '');
        setScript(story.transcript || '');
        setAudioUrl(story.audio_url);
      }
      setFetching(false);
    }
    init();
  }, [id, router]);

  const handleGenerateTTS = async () => {
    if (!script) {
      alert("Please enter a script to generate audio.");
      return;
    }

    setGenerating(true);
    try {
      const placeName = places.find(p => p.id.toString() === placeId)?.name || 'unknown';

      let langCode = 'en';
      if (language === 'hindi') langCode = 'hi';
      if (language === 'bhojpuri' || language === 'maithili') langCode = 'hi';

      const result = await generateAndUploadAudio(script, langCode, placeName);

      if (result.success) {
        if (result.url) {
          setAudioUrl(result.url);
          setFile(null);
        }
      } else {
        alert('Error generating audio: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred during generation.');
    } finally {
      setGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAudioUrl('');
    }
  };

  const handleSubmit = async () => {
    if (!title || !placeId || (!audioUrl && !file)) {
      alert("Please fill in title, select a place, and provide audio.");
      return;
    }

    setLoading(true);
    try {
      let finalAudioUrl = audioUrl;

      // Upload new file if selected
      if (file) {
        const fileName = `upload-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const { error } = await supabase.storage
          .from('audio-stories')
          .upload(fileName, file);

        if (error) throw new Error('File upload failed: ' + error.message);

        const { data: publicUrlData } = supabase.storage
          .from('audio-stories')
          .getPublicUrl(fileName);

        finalAudioUrl = publicUrlData.publicUrl;
      }

      // Update DB
      await updateAudioStoryInDB(id, {
        title,
        description,
        language,
        transcript: script,
        audio_url: finalAudioUrl,
        place_id: parseInt(placeId),
      });

      alert("Audio Story updated successfully!");
      router.push('/dashboard/audio');

    } catch (error: any) {
      console.error(error);
      alert('Failed to update story: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /> Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Audio Story</h1>
          <p className="text-muted-foreground">
            Update the details or audio of your story.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/audio">Cancel</Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column: Details */}
        <div className="flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Story Details</CardTitle>
              <CardDescription>
                Link this story to a place.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="related-places">Related Place</Label>
                <Select value={placeId} onValueChange={setPlaceId}>
                  <SelectTrigger id="related-places">
                    <SelectValue placeholder="Select a place..." />
                  </SelectTrigger>
                  <SelectContent>
                    {places.map((place) => (
                      <SelectItem key={place.id} value={place.id.toString()}>
                        {place.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="story-title">Title</Label>
                <Input
                  id="story-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="bhojpuri">Bhojpuri</SelectItem>
                    <SelectItem value="maithili">Maithili</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Audio & Script */}
        <div className="flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Audio Generation</CardTitle>
              <CardDescription>
                Update the script to regenerate audio.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="subtitles">Script / Subtitles</Label>
                <Textarea
                  id="subtitles"
                  className="min-h-[150px]"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                />
              </div>

              <Button
                onClick={handleGenerateTTS}
                disabled={generating || !script}
                className="w-full"
              >
                {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                Generate New Audio
              </Button>

              {audioUrl && (
                <div className="p-4 bg-muted rounded-md border text-center">
                  <p className="text-sm font-medium mb-2 text-green-600">Current Audio</p>
                  <audio controls src={audioUrl} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manual Upload</CardTitle>
              <CardDescription>Replace with a new MP3 file.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="audio-file">New Audio File (MP3)</Label>
                <Input
                  id="audio-file"
                  type="file"
                  accept=".mp3"
                  onChange={handleFileChange}
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/audio">Cancel</Link>
        </Button>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
          {loading ? 'Updating...' : 'Update Story'}
        </Button>
      </div>
    </div>
  );
}
