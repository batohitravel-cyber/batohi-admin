'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Check,
  X,
  MessageSquare,
  Star,
  Flag,
  Loader2,
  MoreHorizontal,
  CornerDownRight
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Pending');

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching reviews:', error);
    else setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
    const channel = supabase.channel('realtime-reviews')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, fetchReviews)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
    if (error) {
      alert("Failed to update status");
    }
  };

  const openReplyDialog = (review: any) => {
    setSelectedReview(review);
    setReplyText(review.reply || '');
    setIsReplyOpen(true);
  };

  const handleSendReply = async () => {
    if (!selectedReview) return;
    const { error } = await supabase.from('reviews').update({
      reply: replyText,
      reply_at: new Date().toISOString()
    }).eq('id', selectedReview.id);

    if (error) {
      alert('Failed to send reply');
    } else {
      setIsReplyOpen(false);
      alert(`Reply sent to ${selectedReview.user_name || 'User'}!`);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-3 w-3 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(r =>
    activeTab === 'All' ? true : r.status === activeTab
  );

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews Management</h1>
        <p className="text-muted-foreground">
          Moderate user reviews, approve content, and reply to feedback.
        </p>
      </div>

      <Tabs defaultValue="Pending" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 md:w-[600px]">
          <TabsTrigger value="Pending">Pending ({reviews.filter(r => r.status === 'Pending').length})</TabsTrigger>
          <TabsTrigger value="Approved">Approved</TabsTrigger>
          <TabsTrigger value="Rejected">Rejected</TabsTrigger>
          <TabsTrigger value="Spam">Spam</TabsTrigger>
          <TabsTrigger value="All">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{activeTab} Reviews</CardTitle>
              <CardDescription>Manage your {activeTab.toLowerCase()} reviews here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-32"><Loader2 className="animate-spin mx-auto" /></TableCell>
                    </TableRow>
                  ) : filteredReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">No reviews found in this category.</TableCell>
                    </TableRow>
                  ) : (
                    filteredReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="w-[120px] text-xs text-muted-foreground">
                          {format(parseISO(review.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.user_avatar} />
                              <AvatarFallback>{review.user_name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{review.user_name || 'Anonymous'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{review.target_name || 'Unknown'}</span>
                            <Badge variant="outline" className="w-fit text-[10px] px-1 py-0">{review.target_type}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="flex flex-col gap-1">
                            {renderStars(review.rating)}
                            <p className="text-sm line-clamp-2 text-muted-foreground">"{review.comment}"</p>
                            {review.reply && (
                              <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                                <CornerDownRight className="h-3 w-3" />
                                <span>Replied: {review.reply.substring(0, 20)}...</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            review.status === 'Approved' ? 'default' :
                              review.status === 'Rejected' ? 'destructive' :
                                review.status === 'Spam' ? 'destructive' : 'secondary'
                          }>
                            {review.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => updateStatus(review.id, 'Approved')}>
                                <Check className="mr-2 h-4 w-4 text-green-500" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(review.id, 'Rejected')}>
                                <X className="mr-2 h-4 w-4 text-red-500" /> Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(review.id, 'Spam')}>
                                <Flag className="mr-2 h-4 w-4 text-orange-500" /> Mark as Spam
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openReplyDialog(review)}>
                                <MessageSquare className="mr-2 h-4 w-4" /> Reply to User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {selectedReview?.user_name}</DialogTitle>
            <DialogDescription>
              Your reply will be visible on the public review and sent to the user via notification.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="bg-muted p-3 rounded-md text-sm italic">
              "{selectedReview?.comment}"
            </div>
            <Textarea
              placeholder="Write your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyOpen(false)}>Cancel</Button>
            <Button onClick={handleSendReply}>Send Reply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
