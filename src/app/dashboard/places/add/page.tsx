'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { TicketPricingEditor } from '@/components/places/TicketPricingEditor';
import { TimingsEditor } from '@/components/places/TimingsEditor';

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-md" />
});

type Category = {
  id: string;
  name: string;
};

export default function AddPlacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    story: '',
    category_id: '',
    latitude: '',
    longitude: '',
    timings: '',
    ticket_pricing: null as any, // Changed from string ticket_price to object
    distance_from_center: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    must_visit: false,
    trending: false,
    unesco: false,
    status: 'Published',
  });

  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // New handlers for custom editors
  const handleTicketPricingChange = (val: any) => {
    setFormData(prev => ({ ...prev, ticket_pricing: val }));
  };

  const handleTimingsChange = (val: string) => {
    setFormData(prev => ({ ...prev, timings: val }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.category_id) {
        throw new Error('Place name and category are required');
      }

      const { error } = await supabase.from('places').insert([
        {
          name: formData.name,
          description: formData.description,
          story: formData.story || null,
          category_id: formData.category_id,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          timings: formData.timings || null,

          // Use ticket_pricing JSONB
          ticket_pricing: formData.ticket_pricing || null,

          distance_from_center: formData.distance_from_center || null,
          must_visit: formData.must_visit,
          trending: formData.trending,
          unesco: formData.unesco,
          status: formData.status,
          images: images,
          videos: videos,
          image_url: images.length > 0 ? images[0] : null,
          // Pack address fields into JSONB
          address: {
            full: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode
          }
        },
      ]);

      if (error) throw error;

      alert('Place added successfully!');
      router.push('/dashboard/places');
    } catch (error: any) {
      console.error('Error adding place:', error);
      alert('Failed to add place: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Place</h1>
          <p className="text-muted-foreground">
            Fill out the form to add a new tourist attraction.
          </p>
        </div>
        <Button variant="outline" asChild type="button">
          <Link href="/dashboard/places">Cancel</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Place Details</CardTitle>
          <CardDescription>
            Provide essential and narrative information about the place.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Place Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Golghar"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

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
            <Label htmlFor="category_id">Category *</Label>
            <Select value={formData.category_id} onValueChange={handleSelectChange}>
              <SelectTrigger id="category_id">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-full">
            <Label className="mb-2 block">Location</Label>
            <div className="grid gap-4 p-4 border rounded-md">
              <LocationPicker
                onLocationSelect={(lat, lng) => {
                  setFormData(prev => ({
                    ...prev,
                    latitude: lat.toString(),
                    longitude: lng.toString()
                  }));
                }}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    placeholder="e.g., 25.6213"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    placeholder="e.g., 85.1384"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div className="mt-4 grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    placeholder="e.g., 123 Main St, Patna"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="e.g., Patna"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="e.g., Bihar"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      placeholder="e.g., 800001"
                      value={formData.pincode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
          <CardDescription>
            Upload photos and videos for the place.
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
                    type="button"
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
                    type="button"
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="grid gap-2 col-span-1">
              <Label>Timings</Label>
              <TimingsEditor
                value={formData.timings}
                onChange={handleTimingsChange}
              />
            </div>

            <div className="grid gap-2 col-span-1">
              <Label htmlFor="distance_from_center">Distance from Center</Label>
              <Input
                id="distance_from_center"
                placeholder="e.g., 2 km"
                value={formData.distance_from_center}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2 col-span-full">
              <Label>Ticket Pricing</Label>
              <TicketPricingEditor
                value={formData.ticket_pricing}
                onChange={handleTicketPricingChange}
              />
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
                  onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, 'must_visit')}
                />
                <Label htmlFor="must_visit" className="font-normal">Must Visit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trending"
                  checked={formData.trending}
                  onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, 'trending')}
                />
                <Label htmlFor="trending" className="font-normal">Trending</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unesco"
                  checked={formData.unesco}
                  onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, 'unesco')}
                />
                <Label htmlFor="unesco" className="font-normal">UNESCO</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={() => router.push('/dashboard/places')}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Place'}
        </Button>
      </div>
    </form>
  );
}