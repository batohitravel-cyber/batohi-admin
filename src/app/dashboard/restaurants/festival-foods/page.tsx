'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function FestivalFoodsPage() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchDishes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('festival_foods')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setDishes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDishes();
    const channel = supabase
      .channel('realtime-festival-foods')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'festival_foods' }, () => {
        fetchDishes();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredDishes = dishes.filter(d =>
    filter === 'all' || d.festival_name.toLowerCase().replace(' ', '-') === filter
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Festival Special Foods</h1>
          <p className="text-muted-foreground">Manage food recommendations for festivals.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/restaurants/festival-foods/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Dish Card
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Dishes</CardTitle>
          <div className="mt-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="Filter by Festival" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Festivals</SelectItem>
                <SelectItem value="chhath-puja">Chhath Puja</SelectItem>
                <SelectItem value="makar-sankranti">Makar Sankranti</SelectItem>
                <SelectItem value="holi">Holi</SelectItem>
                <SelectItem value="eid">Eid</SelectItem>
                <SelectItem value="diwali">Diwali</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
          ) : filteredDishes.length === 0 ? (
            <div className="text-center p-10 text-muted-foreground">No dishes found. Add one!</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDishes.map((dish) => (
                <Card key={dish.id}>
                  <div className="relative">
                    <Image
                      src={dish.image_url || 'https://picsum.photos/seed/default/300/200'}
                      alt={dish.name}
                      width={300}
                      height={200}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                      {dish.festival_name}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{dish.name}</CardTitle>
                    <CardDescription>
                      {dish.description ? dish.description.substring(0, 50) + '...' : 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between items-center">
                    <span className="font-bold">{dish.price ? `₹${dish.price}` : 'Price N/A'}</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
