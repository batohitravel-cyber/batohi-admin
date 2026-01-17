'use client';

import StatCard from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Headphones, Heart, Clock, BarChart } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';

const topStories = [
  { name: 'Maithili Culture Explained', plays: '2,100', engagement: '92%', image: 'https://picsum.photos/seed/as4/40/40', hint: 'folk art' },
  { name: 'The Legend of Golghar', plays: '1,250', engagement: '85%', image: 'https://picsum.photos/seed/as1/40/40', hint: 'historical monument' },
  { name: 'Patna Museum ki Kahani', plays: '830', engagement: '88%', image: 'https://picsum.photos/seed/as2/40/40', hint: 'museum artifact' },
];

const topSavedPlaces = [
  { name: 'Takht Sri Patna Sahib', saves: '7,800', image: 'https://picsum.photos/seed/p4/40/40', hint: 'sikh temple' },
  { name: 'Golghar', saves: '6,100', image: 'https://picsum.photos/seed/p1/40/40', hint: 'historical monument' },
  { name: 'Patna Museum', saves: '4,200', image: 'https://picsum.photos/seed/p2/40/40', hint: 'museum exterior' },
];

export default function ContentAnalyticsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Analytics</h1>
        <p className="text-muted-foreground">How users are interacting with your content.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Top Audio Story"
          value="Maithili Culture"
          change="2.1k plays"
          icon={Headphones}
        />
        <StatCard
          title="Most Saved Place"
          value="Takht Sri Patna Sahib"
          change="7.8k saves"
          icon={Heart}
        />
        <StatCard
          title="Avg. Engagement Duration"
          value="4m 15s"
          change="+2.1% from last week"
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Audio Stories</CardTitle>
            <CardDescription>Stories with the highest number of plays.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Story Name</TableHead>
                        <TableHead>Plays</TableHead>
                        <TableHead>Avg. Engagement</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {topStories.map((story) => (
                        <TableRow key={story.name}>
                             <TableCell>
                                <Image src={story.image} alt={story.name} width={40} height={40} className="rounded-md" data-ai-hint={story.hint}/>
                             </TableCell>
                            <TableCell className="font-medium">{story.name}</TableCell>
                            <TableCell>{story.plays}</TableCell>
                            <TableCell>{story.engagement}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Most Saved Places</CardTitle>
            <CardDescription>Places that users are saving to their lists most often.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Place Name</TableHead>
                        <TableHead>Saves</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {topSavedPlaces.map((place) => (
                        <TableRow key={place.name}>
                             <TableCell>
                                <Image src={place.image} alt={place.name} width={40} height={40} className="rounded-md" data-ai-hint={place.hint}/>
                             </TableCell>
                            <TableCell className="font-medium">{place.name}</TableCell>
                            <TableCell>{place.saves}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
