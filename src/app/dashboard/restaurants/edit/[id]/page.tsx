'use client';

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

export default function EditRestaurantPage({ params }: { params: { id: string } }) {
  // Mock data, in a real app you would fetch this based on params.id
  const restaurant = {
    id: '1',
    name: 'The Patna Kitchen',
    address: 'Boring Road, Patna, Bihar 800001',
    latitude: '25.6096',
    longitude: '85.1235',
    rating: '4.5',
    priceCategory: 'mid-range',
    mustTryDishes: 'Litti Chokha, Chicken Korma',
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Restaurant</h1>
          <p className="text-muted-foreground">
            Update details for "{restaurant.name}".
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
                <Label htmlFor="restaurant-name">Name</Label>
                <Input id="restaurant-name" defaultValue={restaurant.name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" defaultValue={restaurant.address} />
              </div>
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input id="latitude" defaultValue={restaurant.latitude} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input id="longitude" defaultValue={restaurant.longitude} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Menu & Dishes</CardTitle>
              <CardDescription>
                Highlight the best dishes and upload/replace the menu.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="must-try">Must Try Dishes</Label>
                    <Textarea id="must-try" defaultValue={restaurant.mustTryDishes} />
                     <p className="text-sm text-muted-foreground">
                        Separate dishes with a comma.
                    </p>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="menu-images">Replace Menu Images</Label>
                    <Input id="menu-images" type="file" multiple />
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
                    <Input id="rating" type="number" min="1" max="5" step="0.1" defaultValue={restaurant.rating} />
                </div>
              <div className="grid gap-2">
                <Label htmlFor="price-category">Price Category</Label>
                <Select defaultValue={restaurant.priceCategory}>
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

      <div className="flex justify-between">
        <Button variant="destructive">Delete Restaurant</Button>
        <div className="flex gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Update Restaurant</Button>
        </div>
      </div>
    </div>
  );
}
