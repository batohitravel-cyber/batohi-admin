'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

const popularItineraries = [
  {
    id: 'itin1',
    name: 'Historical Patna in a Day',
    stops: 5,
    avgDuration: '6 hours',
  },
  {
    id: 'itin2',
    name: 'Spiritual Trail: Patna Sahib & Temples',
    stops: 4,
    avgDuration: '5 hours',
  },
  {
    id: 'itin3',
    name: 'Patna Food Walk',
    stops: 6,
    avgDuration: '4 hours',
  },
  {
    id: 'itin4',
    name: 'Relaxing Day at the Park & Zoo',
    stops: 3,
    avgDuration: '7 hours',
  },
];

export default function ItinerariesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Itinerary Dashboard</h1>
        <p className="text-muted-foreground">
          Analyze popular itineraries and user trip data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Popular Itineraries</CardTitle>
          <CardDescription>
            The most frequently used or saved itineraries by users.
          </CardDescription>
          <div className="mt-4 flex items-center gap-4">
            <Select>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by time..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_week">Last 7 days</SelectItem>
                <SelectItem value="last_month">Last 30 days</SelectItem>
                <SelectItem value="all_time">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Itinerary Name</TableHead>
                <TableHead>Stops</TableHead>
                <TableHead>Avg. Duration</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {popularItineraries.map((itinerary) => (
                <TableRow key={itinerary.id}>
                  <TableCell className="font-medium">{itinerary.name}</TableCell>
                  <TableCell>{itinerary.stops}</TableCell>
                  <TableCell>{itinerary.avgDuration}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/itineraries/${itinerary.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
