'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format, isSameDay, parseISO } from 'date-fns';

export default function FestivalCalendarPage() {
  const [festivals, setFestivals] = useState<any[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const fetchFestivals = async () => {
    const { data } = await supabase
      .from('festivals')
      .select('*')
      .order('start_date', { ascending: true });
    if (data) setFestivals(data);
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  const festivalDates = festivals.map(f => parseISO(f.start_date));

  const selectedFestival = festivals.find(f =>
    date && isSameDay(parseISO(f.start_date), date)
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Festival Calendar</h1>
        <p className="text-muted-foreground">View upcoming cultural events.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Dates with red dots have festivals.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                booked: festivalDates
              }}
              modifiersStyles={{
                booked: {
                  position: 'relative',
                }
              }}
              // Using a custom class or style to add the red mark
              // Since 'modifiersStyles' applies to the button, we can add a border or color.
              // To do a 'dot', we might need custom components, but let's try a red border/background first as requested.
              modifiersClassNames={{
                booked: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-red-500 after:rounded-full"
              }}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold">
            {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
          </h2>

          {selectedFestival ? (
            <Card className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-48 h-48 sm:h-auto relative bg-muted">
                  <Image
                    src={selectedFestival.images?.[0] || 'https://picsum.photos/seed/fest/300/200'}
                    alt={selectedFestival.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl">{selectedFestival.name}</h3>
                      <Badge>{selectedFestival.status}</Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-4 mb-2">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {format(parseISO(selectedFestival.start_date), 'MMM d, yyyy')}
                      </span>
                      {selectedFestival.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {selectedFestival.location}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {selectedFestival.description}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/festivals/edit/${selectedFestival.id}`}>
                        <Edit className="h-3 w-3 mr-2" /> View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="p-10 border border-dashed rounded-lg text-center text-muted-foreground">
              No festival on this date.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
