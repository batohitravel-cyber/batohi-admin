'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Clock, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const itinerary = {
  id: 'itin1',
  name: 'Historical Patna in a Day',
  stops: [
    { name: 'Golghar', time: '1 hour' },
    { name: 'Patna Museum', time: '2 hours' },
    { name: 'Buddha Smriti Park', time: '1.5 hours' },
    { name: 'Gandhi Maidan', time: '30 minutes' },
    { name: 'Takht Sri Patna Sahib', time: '1.5 hours' },
  ],
};

export default function ItineraryDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{itinerary.name}</h1>
          <p className="text-muted-foreground">
            Detailed view of a specific itinerary.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/itineraries">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Stops & Timings</CardTitle>
              <CardDescription>
                The sequence of stops and estimated time at each location.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {itinerary.stops.map((stop, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{stop.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{stop.time}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Map Path</CardTitle>
              <CardDescription>
                Visual representation of the itinerary route.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <div className="w-full h-full bg-muted rounded-md relative overflow-hidden">
                <Image
                  src="https://picsum.photos/seed/pathmap/1200/800"
                  alt="Itinerary map path"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                  data-ai-hint="city map route"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
