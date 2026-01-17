'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Ban, ShieldCheck, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import placeholderImages from '@/lib/placeholder-images.json';

const user = {
    id: 'usr_1',
    name: 'Alia Sharma',
    email: 'alia.sharma@example.com',
    avatar: 'user1',
    joinDate: '2023-05-15',
    recentTrips: [
        { name: 'Golghar Visit', date: '2024-07-15', image: 'https://picsum.photos/seed/p1/40/40', hint: 'historical monument' },
        { name: 'Museum Tour', date: '2024-06-20', image: 'https://picsum.photos/seed/p2/40/40', hint: 'museum artifact' },
    ],
    reviews: [
        { place: 'Golghar', rating: 5, text: 'Amazing experience, the audio guide was perfect.' },
        { place: 'Patna Museum', rating: 4, text: 'Great collection, but could be better maintained.' },
    ],
    reports: 1,
};

const getImage = (id: string) => placeholderImages.placeholderImages.find(p => p.id === id);


export default function UserDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
                <p className="text-muted-foreground">Detailed view of {user.name}'s activity.</p>
            </div>
            <Button variant="outline" asChild><Link href="/dashboard/users">Back to User List</Link></Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-8">
                <Card>
                    <CardContent className="pt-6 flex flex-col items-center gap-4">
                        <Avatar className="h-24 w-24 border">
                            <AvatarImage src={getImage(user.avatar)?.imageUrl} alt={user.name} data-ai-hint={getImage(user.avatar)?.imageHint}/>
                            <AvatarFallback>{user.name.slice(0,2)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            <p className="text-sm text-muted-foreground">Joined: {user.joinDate}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Actions</CardTitle>
                        <CardDescription>Moderate this user's account.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Button variant="outline"><Ban className="mr-2"/> Restrict User</Button>
                        <Button variant="destructive"><Ban className="mr-2"/> Ban User</Button>
                        <Button variant="destructive" className="mt-4"><Trash2 className="mr-2"/> Delete User Account</Button>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Trips & Itineraries</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {user.recentTrips.map(trip => (
                             <div key={trip.name} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                                 <Image src={trip.image} alt={trip.name} width={40} height={40} className="rounded-md" data-ai-hint={trip.hint}/>
                                 <div>
                                     <p className="font-semibold">{trip.name}</p>
                                     <p className="text-sm text-muted-foreground">{trip.date}</p>
                                 </div>
                             </div>
                         ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Reviews Posted</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {user.reviews.map(review => (
                             <div key={review.place}>
                                 <p className="font-semibold">{review.place} ({review.rating} ★)</p>
                                 <p className="text-sm text-muted-foreground">"{review.text}"</p>
                             </div>
                         ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Flags & Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This user has <span className="font-bold text-destructive">{user.reports} report(s)</span> against them.</p>
                        <Button variant="link" className="p-0 h-auto mt-2" asChild>
                            <Link href="/dashboard/users/reports">View Reports</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
