'use client';

import { useState, useEffect, use } from 'react';
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center">Loading Map...</div>
});

const PRICE_CATEGORIES = ['budget', 'mid-range', 'fine-dining'];

export default function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    rating: '',
    price_category: 'mid-range',
    must_try_dishes: '', // Comma separated string for input
  });

  useEffect(() => {
    async function fetchRestaurant() {
      if (!id) return;

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching restaurant:', error);
        toast({
          title: "Error",
          description: "Details could not be loaded.",
          variant: "destructive"
        });
        router.push('/dashboard/restaurants');
        return;
      }

      if (data) {
        setFormData({
          name: data.name || '',
          address: data.address || '',
          latitude: data.latitude ? String(data.latitude) : '',
          longitude: data.longitude ? String(data.longitude) : '',
          rating: data.rating ? String(data.rating) : '',
          price_category: data.price_category || 'mid-range',
          must_try_dishes: data.must_try_dishes ? data.must_try_dishes.join(', ') : '',
        });
      }
      setLoading(false);
    }

    fetchRestaurant();
  }, [id, router, toast]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
  };

  const handleUpdate = async () => {
    setSaving(true);

    // Process dishes array
    const dishesArray = formData.must_try_dishes
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    const updates = {
      name: formData.name,
      address: formData.address,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      rating: formData.rating ? parseFloat(formData.rating) : 0,
      price_category: formData.price_category,
      must_try_dishes: dishesArray,
      // Status not editable here for now, or keep existing? Usually edit retains status.
    };

    const { error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({
        title: "Error updating",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Restaurant updated successfully."
      });
      router.push('/dashboard/restaurants');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this restaurant?")) return;

    setSaving(true);
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting",
        description: error.message,
        variant: "destructive"
      });
      setSaving(false); // Only stop saving if error, otherwise we redirect
    } else {
      toast({
        title: "Deleted",
        description: "Restaurant deleted successfully."
      });
      router.push('/dashboard/restaurants');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Restaurant</h1>
          <p className="text-muted-foreground">
            Update details for "{formData.name}".
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Restaurant
          </Button>
        </div>
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
                <Label htmlFor="restaurant-name">Name</Label>
                <Input
                  id="restaurant-name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>

              {/* Location Picker Integration */}
              <div className="grid gap-2">
                <Label>Location</Label>
                <LocationPicker
                  initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
                  initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    value={formData.latitude}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value={formData.longitude}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Menu & Dishes</CardTitle>
              <CardDescription>
                Highlight the best dishes.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="must-try">Must Try Dishes</Label>
                <Textarea
                  id="must-try"
                  value={formData.must_try_dishes}
                  onChange={(e) => handleChange('must_try_dishes', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Separate dishes with a comma.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Ratings & Pricing</CardTitle>
              <CardDescription>
                Set the rating and price category.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="rating">Rating (0 - 5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => handleChange('rating', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price-category">Price Category</Label>
                <Select
                  value={formData.price_category}
                  onValueChange={(val) => handleChange('price_category', val)}
                >
                  <SelectTrigger id="price-category">
                    <SelectValue placeholder="Select a price category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between border-t pt-6">
        <Button variant="destructive" onClick={handleDelete} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : "Delete Restaurant"}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Restaurant
          </Button>
        </div>
      </div>
    </div>
  );
}
