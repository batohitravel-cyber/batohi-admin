'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';

export default function HeatmapPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Location Heatmap</h1>
        <p className="text-muted-foreground">
          A visual representation of the most visited and viewed locations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patna City Heatmap</CardTitle>
          <CardDescription>
            Brighter areas indicate higher user traffic and engagement.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[600px] w-full">
            <div className="w-full h-full bg-muted rounded-md relative overflow-hidden">
             <Image
                src="https://picsum.photos/seed/heatmap/1200/800"
                alt="City Heatmap"
                layout="fill"
                objectFit="cover"
                className="rounded-md opacity-80"
                data-ai-hint="city heatmap"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
