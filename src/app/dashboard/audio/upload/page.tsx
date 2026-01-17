'use client';

import { useState, useEffect } from 'react';
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
import { supabase } from '@/lib/supabaseClient'; // Client for fetching places & manual upload
import { generateAndUploadAudio, saveAudioStoryToDB } from '../actions'; // Server actions
import { Loader2, PlayCircle, UploadCloud } from 'lucide-react';

export default function UploadAudioStoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    async function fetchPlaces() {
      const { data } = await supabase.from('places').select('id, name');
      if (data) setPlaces(data);
    }
    fetchPlaces();
  }, []);

  // Handler: Generate Audio via TTS
  const handleGenerateTTS = async () => {
    if (!script) {
      alert("Please enter a script to generate audio.");
      return;
    }

    setGenerating(true);
    try {
      const placeName = places.find(p => p.id.toString() === placeId)?.name || 'unknown';

      // Map common names to Google TTS codes
      let langCode = 'en';
      if (language === 'hindi') langCode = 'hi';
      // Note: Bhojpuri/Maithili might not be fully supported by basic Google TTS info, falling back to Hindi or trying their codes if applicable.
      if (language === 'bhojpuri' || language === 'maithili') langCode = 'hi';

      const result = await generateAndUploadAudio(script, langCode, placeName);

      if (result.success) {
        if (result.url) {
          setAudioUrl(result.url);
          setFile(null); // Clear manual file if TTS is used
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

  // Handler: Manual File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAudioUrl(''); // Clear TTS url if file is selected
    }
  };

  // Handler: Submit Form
  const handleSubmit = async () => {
    if (!title || !placeId || (!audioUrl && !file)) {
      alert("Please fill in title, select a place, and provide audio (Generated or Uploaded).");
      return;
    }

    setLoading(true);
    try {
      let finalAudioUrl = audioUrl;

      // If manual file, upload it now
      if (file) {
        const fileName = `upload-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const { data, error } = await supabase.storage
          .from('audio-stories')
          .upload(fileName, file);

        if (error) throw new Error('File upload failed: ' + error.message);

        const { data: publicUrlData } = supabase.storage
          .from('audio-stories')
          .getPublicUrl(fileName);

        finalAudioUrl = publicUrlData.publicUrl;
      }

      // Save to DB
      await saveAudioStoryToDB({
        title,
        description,
        language,
        transcript: script,
        audio_url: finalAudioUrl,
        place_id: parseInt(placeId),
        status: 'Published', // Start as published for now
      });

      alert("Audio Story saved successfully!");
      router.push('/dashboard/audio');

    } catch (error: any) {
      console.error(error);
      alert('Failed to save story: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload New Audio Story</h1>
          <p className="text-muted-foreground">
            Generate audio from text or upload your own file.
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
                  placeholder="e.g., The History of Golghar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Short summary..."
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
              <CardTitle>Audio Generation (TTS)</CardTitle>
              <CardDescription>
                Write your script and generate audio automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="subtitles">Script / Subtitles</Label>
                <Textarea
                  id="subtitles"
                  placeholder="Enter the text to be spoken..."
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
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Audio...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" /> Generate Audio from Script
                  </>
                )}
              </Button>

              {audioUrl && (
                <div className="p-4 bg-muted rounded-md border text-center">
                  <p className="text-sm font-medium mb-2 text-green-600">Audio Generated Successfully!</p>
                  <audio controls src={audioUrl} className="w-full" />
                  <p className="text-xs text-muted-foreground mt-2">Listen to the preview above.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manual Upload</CardTitle>
              <CardDescription>Or upload an MP3 file directly.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="audio-file">Audio File (MP3)</Label>
                <Input
                  id="audio-file"
                  type="file"
                  accept=".mp3"
                  onChange={handleFileChange}
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name} (Will override generated audio)
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
          {loading ? 'Saving Story...' : 'Save & Publish Story'}
        </Button>
      </div>
    </div>
  );
}
