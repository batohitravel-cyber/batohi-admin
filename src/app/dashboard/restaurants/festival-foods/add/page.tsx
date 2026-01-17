'use client';

import { useState, useEffect } from 'react';
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

export default function AddFestivalFoodPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // State
    const [name, setName] = useState('');
    const [festival, setFestival] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState<File | null>(null);

    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [restaurantId, setRestaurantId] = useState('');

    useEffect(() => {
        // Fetch restaurants for linking
        const fetchRestaurants = async () => {
            const { data } = await supabase.from('restaurants').select('id, name');
            if (data) setRestaurants(data);
        };
        fetchRestaurants();
    }, []);

    const handleSubmit = async () => {
        if (!name || !festival) {
            alert("Please fill in Name and Festival.");
            return;
        }

        setLoading(true);
        try {
            let imageUrl = '';
            if (image) {
                const fileName = `fest-${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
                const { error } = await supabase.storage.from('restaurants-media').upload(fileName, image);
                if (error) throw error;
                const { data } = supabase.storage.from('restaurants-media').getPublicUrl(fileName);
                imageUrl = data.publicUrl;
            }

            const { error } = await supabase.from('festival_foods').insert({
                name,
                festival_name: festival,
                description,
                price: parseFloat(price) || null,
                image_url: imageUrl,
                restaurant_id: restaurantId || null
            });

            if (error) throw error;

            alert("Dish added successfully!");
            router.push('/dashboard/restaurants/festival-foods');

        } catch (error: any) {
            console.error(error);
            alert('Error adding dish: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add Festival Dish</h1>
                    <p className="text-muted-foreground">
                        Recommend a special dish for a festival.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/restaurants/festival-foods">Cancel</Link>
                </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="flex flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dish Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="dish-name">Dish Name *</Label>
                                <Input
                                    id="dish-name"
                                    placeholder="e.g., Thekua"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="festival">Festival *</Label>
                                <Select value={festival} onValueChange={setFestival}>
                                    <SelectTrigger id="festival">
                                        <SelectValue placeholder="Select Festival" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Chhath Puja">Chhath Puja</SelectItem>
                                        <SelectItem value="Makar Sankranti">Makar Sankranti</SelectItem>
                                        <SelectItem value="Holi">Holi</SelectItem>
                                        <SelectItem value="Diwali">Diwali</SelectItem>
                                        <SelectItem value="Eid">Eid</SelectItem>
                                        <SelectItem value="Durga Puja">Durga Puja</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Short description..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Availability & Image</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="restaurant">Available At (Optional)</Label>
                                <Select value={restaurantId} onValueChange={setRestaurantId}>
                                    <SelectTrigger id="restaurant">
                                        <SelectValue placeholder="Select Restaurant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {restaurants.map(r => (
                                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">Approx Price (₹)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="e.g., 50"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="image">Dish Image</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => { if (e.target.files) setImage(e.target.files[0]) }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/restaurants/festival-foods">Cancel</Link>
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    Add Dish
                </Button>
            </div>
        </div>
    );
}
