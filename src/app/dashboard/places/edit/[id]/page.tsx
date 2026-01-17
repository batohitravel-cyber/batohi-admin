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
    story: '',
    category_id: '',
    latitude: '',
    longitude: '',
    timings: '',
    ticket_price: '',
    distance_from_center: '',
    must_visit: false,
    trending: false,
    unesco: false,
    status: 'Published',
  });

  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchPlace();
    fetchCategories();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

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
        story: data.story || '',
        category_id: data.category_id || '',
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
        timings: data.timings || '',
        ticket_price: data.ticket_price || '',
        distance_from_center: data.distance_from_center || '',
        must_visit: data.must_visit || false,
        trending: data.trending || false,
        unesco: data.unesco || false,
        status: data.status || 'Draft',
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
    setFormData((prev) => ({ ...prev, category_id: value }));
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
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          images: images,
          videos: videos,
          image_url: images.length > 0 ? images[0] : null,
          updated_at: new Date().toISOString(),
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
          {/* <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div> */}
          <div className="grid gap-2">
            <Label htmlFor="story">Story Description</Label>
            <Textarea
              id="story"
              placeholder="Tell the full story, history, or cultural significance of this place..."
              value={formData.story}
              onChange={handleChange}
              rows={6}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category_id} onValueChange={handleSelectChange}>
              <SelectTrigger id="category_id">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
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
              <Label htmlFor="distance_from_center">Distance from Center</Label>
              <Input id="distance_from_center" value={formData.distance_from_center} onChange={handleChange} />
            </div>
          </div>
          <Separator />
          <div className="grid gap-4">
            <Label>Special Labels</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="must_visit"
                  checked={formData.must_visit}
                  onCheckedChange={(c) => handleCheckboxChange(c as boolean, 'must_visit')}
                />
                <Label htmlFor="must_visit" className="font-normal">Must Visit</Label>
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
