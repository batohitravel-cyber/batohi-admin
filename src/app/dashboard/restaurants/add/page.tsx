'use client';

import { useState } from 'react';
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
import Link from 'next/link';
import { Loader2, UploadCloud } from 'lucide-react';

export default function AddRestaurantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [rating, setRating] = useState('');
  const [priceCategory, setPriceCategory] = useState<'budget' | 'mid-range' | 'fine-dining'>('mid-range');
  const [mustTry, setMustTry] = useState('');

  // Files
  const [images, setImages] = useState<File[]>([]);
  const [menuImages, setMenuImages] = useState<File[]>([]);

  // Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'menu') => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      if (type === 'main') setImages(prev => [...prev, ...fileArray]);
      else setMenuImages(prev => [...prev, ...fileArray]);
    }
  };

  const uploadFiles = async (files: File[]) => {
    const urls: string[] = [];
    for (const file of files) {
      const fileName = `rest-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { error } = await supabase.storage.from('restaurants-media').upload(fileName, file);
      if (error) {
        console.error('Upload failed:', error);
        continue; // Skip failed uploads
      }
      const { data } = supabase.storage.from('restaurants-media').getPublicUrl(fileName);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!name || !address) {
      alert("Please fill in the required fields (Name, Address).");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Images
      const imageUrls = await uploadFiles(images);
      const menuUrls = await uploadFiles(menuImages);

      // 2. Parse Data
      const dishesArray = mustTry.split(',').map(s => s.trim()).filter(Boolean);

      // 3. Insert to DB
      const { error } = await supabase.from('restaurants').insert({
        name,
        address,
        latitude: parseFloat(latitude) || null,
        longitude: parseFloat(longitude) || null,
        rating: parseFloat(rating) || 0,
        price_category: priceCategory,
        must_try_dishes: dishesArray,
        images: imageUrls,
        menu_images: menuUrls,
        status: 'Published' // default to published
      });

      if (error) throw error;

      alert("Restaurant added successfully!");
      router.push('/dashboard/restaurants');

    } catch (error: any) {
      console.error(error);
      alert('Error adding restaurant: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Restaurant</h1>
          <p className="text-muted-foreground">
            Fill out the form to add a new restaurant to the platform.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/restaurants">Cancel</Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Details</CardTitle>
              <CardDescription>
                Provide the core information about the restaurant.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="restaurant-name">Name *</Label>
                <Input
                  id="restaurant-name"
                  placeholder="e.g., The Patna Kitchen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  placeholder="e.g., Boring Road, Patna, Bihar 800001"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    placeholder="e.g., 25.6096"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    placeholder="e.g., 85.1235"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="main-images">Restaurant Images</Label>
                <Input id="main-images" type="file" multiple accept="image/*" onChange={(e) => handleImageChange(e, 'main')} />
                <p className="text-xs text-muted-foreground">{images.length} files selected</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Menu & Dishes</CardTitle>
              <CardDescription>
                Highlight the best dishes and upload the menu.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="must-try">Must Try Dishes</Label>
                <Textarea
                  id="must-try"
                  placeholder="Litti Chokha, Chicken Korma, etc."
                  value={mustTry}
                  onChange={(e) => setMustTry(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Separate dishes with a comma.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="menu-images">Upload Menu Images</Label>
                <Input id="menu-images" type="file" multiple accept="image/*" onChange={(e) => handleImageChange(e, 'menu')} />
                <p className="text-xs text-muted-foreground">{menuImages.length} files selected</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Ratings & Pricing</CardTitle>
              <CardDescription>
                Set the rating and price category for the restaurant.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="rating">Rating (out of 5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="e.g., 4.5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price-category">Price Category</Label>
                <Select value={priceCategory} onValueChange={(v: any) => setPriceCategory(v)}>
                  <SelectTrigger id="price-category">
                    <SelectValue placeholder="Select a price category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget ($)</SelectItem>
                    <SelectItem value="mid-range">Mid-range ($$)</SelectItem>
                    <SelectItem value="fine-dining">Fine Dining ($$$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard/restaurants">Cancel</Link>
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
          Add Restaurant
        </Button>
      </div>
    </div>
  );
}
