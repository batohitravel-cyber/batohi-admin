'use client';

import StatCard from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, Search, Heart } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';

const topPlacesData = [
  { name: 'Golghar', image: 'https://picsum.photos/seed/p1/40/40', hint: 'historical monument', visited: '12,500', searched: '8,200', saved: '6,100' },
  { name: 'Patna Museum', image: 'https://picsum.photos/seed/p2/40/40', hint: 'museum building', visited: '9,800', searched: '6,500', saved: '4,200' },
  { name: 'Takht Sri Patna Sahib', image: 'https://picsum.photos/seed/p4/40/40', hint: 'sikh gurdwara', visited: '15,200', searched: '7,100', saved: '7,800' },
  { name: 'Buddha Smriti Park', image: 'https://picsum.photos/seed/p5/40/40', hint: 'buddha statue', visited: '7,600', searched: '5,300', saved: '3,900' },
];


export default function TopPlacesAnalyticsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Top Places Analytics</h1>
        <p className="text-muted-foreground">Discover which attractions are trending with users.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Most Visited"
          value="Takht Sri Patna Sahib"
          change="15.2k visits"
          icon={Eye}
        />
        <StatCard
          title="Most Searched"
          value="Golghar"
          change="8.2k searches"
          icon={Search}
        />
        <StatCard
          title="Most Saved"
          value="Takht Sri Patna Sahib"
          change="7.8k saves"
          icon={Heart}
        />
      </div>

      <Card>
          <CardHeader>
            <CardTitle>Place Performance Breakdown</CardTitle>
            <CardDescription>
                A detailed look at the most popular places.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Place Name</TableHead>
                        <TableHead>Most Visited</TableHead>
                        <TableHead>Most Searched</TableHead>
                        <TableHead>Most Saved</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {topPlacesData.map((place) => (
                        <TableRow key={place.name}>
                             <TableCell>
                                <Image src={place.image} alt={place.name} width={40} height={40} className="rounded-md" data-ai-hint={place.hint}/>
                             </TableCell>
                            <TableCell className="font-medium">{place.name}</TableCell>
                            <TableCell>{place.visited}</TableCell>
                            <TableCell>{place.searched}</TableCell>
                            <TableCell>{place.saved}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
