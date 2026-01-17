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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import placeholderImages from '@/lib/placeholder-images.json';
import Link from 'next/link';

const abandonedChats = [
  {
    id: 'chat1',
    userName: 'Rohan Verma',
    userAvatar: 'user2',
    lastMessage: 'Okay, and after Golghar, what about...',
    dropOff: 'Itinerary Planning',
  },
  {
    id: 'chat2',
    userName: 'Alia Sharma',
    userAvatar: 'user1',
    lastMessage: 'How far is the museum from...',
    dropOff: 'Question',
  },
  {
    id: 'chat3',
    userName: 'Karan Mishra',
    userAvatar: 'user4',
    lastMessage: 'Tell me about the best food near...',
    dropOff: 'Recommendation',
  },
];

const getImage = (id: string) => placeholderImages.placeholderImages.find(p => p.id === id);


export default function AbandonedChatsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Abandoned Chat Requests</h1>
        <p className="text-muted-foreground">
          Analyze AI chat sessions where users dropped off.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chat Drop-off Analytics</CardTitle>
          <CardDescription>
            Review chat logs to understand why users might be ending their conversations prematurely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Last Message</TableHead>
                <TableHead>Drop-off Point</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {abandonedChats.map((chat) => (
                <TableRow key={chat.id}>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={getImage(chat.userAvatar)?.imageUrl} alt={chat.userName} data-ai-hint={getImage(chat.userAvatar)?.imageHint}/>
                            <AvatarFallback>{chat.userName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{chat.userName}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground italic">"{chat.lastMessage}"</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{chat.dropOff}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">View Log</Button>
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

