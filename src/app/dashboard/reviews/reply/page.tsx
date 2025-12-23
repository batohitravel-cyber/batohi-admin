'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import placeholderImages from '@/lib/placeholder-images.json';


const messages = [
    { from: 'user', text: 'The audio story for Golghar was absolutely mesmerizing! Highly recommend.', avatar: 'user1', name: 'Alia Sharma' },
    { from: 'admin', text: 'Thank you so much, Alia! We are thrilled you enjoyed it.', avatar: 'adminAvatar', name: 'Batohi Admin' },
    { from: 'user', text: 'I will definitely recommend it to my friends!', avatar: 'user1', name: 'Alia Sharma' },
];

const getImage = (id: string) =>
  placeholderImages.placeholderImages.find((p) => p.id === id);


export default function DirectReplyPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/reviews">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Direct Reply</h1>
          <p className="text-muted-foreground">
            Replying to feedback from <span className="font-semibold">Alia Sharma</span>
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Conversation</CardTitle>
            <CardDescription>A chat-like interface for responding to user feedback.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 h-[500px] overflow-y-auto p-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-end gap-3 ${message.from === 'admin' ? 'justify-end' : ''}`}
            >
              {message.from === 'user' && (
                 <Avatar>
                    <AvatarImage src={getImage(message.avatar)?.imageUrl} alt={message.name} data-ai-hint={getImage(message.avatar)?.imageHint} />
                    <AvatarFallback>{message.name.slice(0,2)}</AvatarFallback>
                </Avatar>
              )}
               <div className={`rounded-lg px-4 py-3 max-w-[70%] ${message.from === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm">{message.text}</p>
              </div>
              {message.from === 'admin' && (
                 <Avatar>
                    <AvatarImage src={getImage(message.avatar)?.imageUrl} alt={message.name} data-ai-hint={getImage(message.avatar)?.imageHint} />
                    <AvatarFallback>{message.name.slice(0,2)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter className="border-t pt-6">
            <div className="flex w-full items-center gap-2">
                <Input placeholder="Type your reply..." />
                <Button>
                    <Send className="mr-2"/> Send
                </Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
