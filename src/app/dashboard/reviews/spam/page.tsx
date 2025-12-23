'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

const spamReviews = [
  {
    id: 'spam1',
    user: 'User_12345',
    place: 'Golghar',
    content: 'BUY CHEAP FOLLOWERS NOW!!! www.getfollowers.scam',
    reason: 'Suspicious Link',
  },
  {
    id: 'spam2',
    user: 'BotAccount007',
    place: 'Patna Museum',
    content: 'great place great place great place great place great place',
    reason: 'Repetitive Content',
  },
  {
    id: 'spam3',
    user: 'AdPromo',
    place: 'Buddha Smriti Park',
    content: 'Visit my cool new blog for travel tips!',
    reason: 'Self-promotion',
  },
];


export default function SpamFilterPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Spam Filter</h1>
        <p className="text-muted-foreground">
          Manage reviews automatically detected as spam.
        </p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Spam Queue</CardTitle>
          <CardDescription>
            These reviews have been flagged as potential spam.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Review Content</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spamReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.user}</TableCell>
                  <TableCell className="text-muted-foreground italic">"{review.content}"</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{review.reason}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Restore Review (Not Spam)</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete Permanently</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
