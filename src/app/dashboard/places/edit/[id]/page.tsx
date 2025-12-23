'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
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
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import Image from 'next/image';

// Helper to unwrap params in Next.js 15+ if needed, but for simple client comp:
// We can use the prop directly if it's passed as a promise, or just use React.use()
// However, the cleanest way in a client component in the 'page' file is often to just take the prop.
// If valid Next.js 13+ params, it's just { params }: { params: { id: string } }
// But beware of Next 15 async params changes. Safe bet: use `useParams` hook inside or `use` the params.

export default function EditPlacePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const id = params.id;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    latitude: '',
    longitude: '',
    timings: '',
    ticket_price: '',
    distance: '',
    mustVisit: false,
    trending: false,
    unesco: false,
    status: 'Published'
  });

  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPlace();
  }, [id]);

  const fetchPlace = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching place:', error);
        alert('Place not found!');
        router.push('/dashboard/places');
        return;
      }

      setFormData({
        name: data.name || '',
        description: data.description || '',
        category: data.category || '',
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
        timings: data.timings || '',
        ticket_price: data.ticket_price || '',
        distance: data.distance_from_center || '',
        mustVisit: data.must_visit || false,
        trending: data.trending || false,
        unesco: data.unesco || false,
        status: data.status || 'Draft'
      });

      setImages(data.images || []);
      setVideos(data.videos || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleCheckboxChange = (checked: boolean, id: string) => {
    setFormData((prev) => ({ ...prev, [id]: checked }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const files = Array.from(e.target.files);
    const newUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${type}s/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('places_media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('places_media')
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
      }

      if (type === 'image') {
        setImages(prev => [...prev, ...newUrls]);
      } else {
        setVideos(prev => [...prev, ...newUrls]);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeMedia = (index: number, type: 'image' | 'video') => {
    if (type === 'image') {
      setImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setVideos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('places')
        .update({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          status: formData.status,
          must_visit: formData.mustVisit,
          trending: formData.trending,
          unesco: formData.unesco,
          timings: formData.timings,
          ticket_price: formData.ticket_price,
          distance_from_center: formData.distance,
          images: images,
          videos: videos,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      alert('Place updated successfully!');
      router.push('/dashboard/places');
    } catch (error: any) {
      console.error('Update error:', error);
      alert('Failed to update: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading place details...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Place: {formData.name}</h1>
          <p className="text-muted-foreground">
            Modify the details for this attraction.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/places">Cancel</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Place Details</CardTitle>
          <CardDescription>
            Provide the essential information about the place.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Place Name</Label>
            <Input id="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={handleSelectChange}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Historical Monument">Historical Monument</SelectItem>
                <SelectItem value="Museum">Museum</SelectItem>
                <SelectItem value="Zoo">Zoo</SelectItem>
                <SelectItem value="Religious">Religious</SelectItem>
                <SelectItem value="Park">Park</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input id="latitude" value={formData.latitude} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input id="longitude" value={formData.longitude} onChange={handleChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
          <CardDescription>
            Upload new photos and videos or manage existing ones.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="photos">Photos</Label>
            <div className="flex flex-wrap gap-4 mb-4">
              {images.map((url, idx) => (
                <div key={idx} className="relative w-24 h-24 group">
                  <Image
                    src={url}
                    alt="Place"
                    fill
                    className="object-cover rounded-md"
                  />
                  <button
                    onClick={() => removeMedia(idx, 'image')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 hover:bg-red-600 shadow-sm"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <Input id="photos" type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} disabled={uploading} />
            {uploading && <p className="text-sm text-yellow-600">Uploading...</p>}
          </div>

          <Separator />

          <div className="grid gap-2">
            <Label htmlFor="videos">Videos</Label>
            <div className="flex flex-wrap gap-4 mb-4">
              {videos.map((url, idx) => (
                <div key={idx} className="relative w-40 h-24 bg-black rounded-md flex items-center justify-center group overflow-hidden">
                  <video src={url} className="w-full h-full object-cover opacity-60" />
                  <span className="absolute text-white text-xs font-bold">VIDEO</span>
                  <button
                    onClick={() => removeMedia(idx, 'video')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 hover:bg-red-600 shadow-sm"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <Input id="videos" type="file" multiple accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} disabled={uploading} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Facts & Labels</CardTitle>
          <CardDescription>
            Provide key facts and assign special labels.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="timings">Timings</Label>
              <Input id="timings" value={formData.timings} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ticket_price">Ticket Price</Label>
              <Input id="ticket_price" value={formData.ticket_price} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="distance">Distance</Label>
              <Input id="distance" value={formData.distance} onChange={handleChange} />
            </div>
          </div>
          <Separator />
          <div className="grid gap-4">
            <Label>Special Labels</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mustVisit"
                  checked={formData.mustVisit}
                  onCheckedChange={(c) => handleCheckboxChange(c as boolean, 'mustVisit')}
                />
                <Label htmlFor="mustVisit" className="font-normal">Must Visit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trending"
                  checked={formData.trending}
                  onCheckedChange={(c) => handleCheckboxChange(c as boolean, 'trending')}
                />
                <Label htmlFor="trending" className="font-normal">Trending</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unesco"
                  checked={formData.unesco}
                  onCheckedChange={(c) => handleCheckboxChange(c as boolean, 'unesco')}
                />
                <Label htmlFor="unesco" className="font-normal">UNESCO</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard/places">Cancel</Link>
        </Button>
        <Button onClick={handleSubmit} disabled={saving || uploading}>
          {saving ? 'Updating...' : 'Update Place'}
        </Button>
      </div>
    </div>
  );
}
