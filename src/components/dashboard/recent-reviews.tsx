import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, StarHalf } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';

const reviews = [
  {
    name: 'Alia Sharma',
    avatar: 'user1',
    review: 'The audio story for Golghar was absolutely mesmerizing! Highly recommend.',
    rating: 5,
  },
  {
    name: 'Rohan Verma',
    avatar: 'user2',
    review: 'Litti Chokha at the recommended place was authentic and delicious. Thanks Batohi!',
    rating: 4.5,
  },
  {
    name: 'Priya Singh',
    avatar: 'user3',
    review: 'The app helped me explore Patna Sahib Gurudwara. The information was very accurate.',
    rating: 5,
  },
  {
    name: 'Karan Mishra',
    avatar: 'user4',
    review: 'Could use more details on the museum timings. But overall a great experience.',
    rating: 4,
  },
];

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div className="flex items-center gap-0.5 text-primary">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 fill-primary" />
      ))}
      {halfStar && <StarHalf className="h-4 w-4 fill-primary" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground/50" />
      ))}
    </div>
  );
};

export default function RecentReviews() {
    const getImage = (id: string) => placeholderImages.placeholderImages.find(p => p.id === id);

  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <div key={index} className="flex items-start gap-4">
          <Avatar className="h-10 w-10 border-2 border-border">
            <AvatarImage src={getImage(review.avatar)?.imageUrl} alt={review.name} data-ai-hint={getImage(review.avatar)?.imageHint}/>
            <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{review.name}</p>
            </div>
            <p className="text-sm text-muted-foreground">{review.review}</p>
            {renderStars(review.rating)}
          </div>
        </div>
      ))}
    </div>
  );
}
