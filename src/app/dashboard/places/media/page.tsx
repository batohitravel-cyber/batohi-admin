'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, X, Filter } from 'lucide-react';
import Image from 'next/image';

type Place = {
  id: number;
  name: string;
  images: string[];
  videos: string[];
};

type MediaItem = {
  url: string;
  type: 'image' | 'video';
  placeId: number;
  placeName: string;
};

export default function PlaceMediaPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Upload State
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('all');
  const [uploadPlaceId, setUploadPlaceId] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPlaces();

    // Subscribe to changes in 'places' table to keep media gallery in sync
    const channel = supabase
      .channel('realtime-media')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'places' },
        (payload) => {
           console.log('Media/Places update:', payload);
           fetchPlaces();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('places').select('id, name, images, videos').order('name');
    
    if (error) {
        console.error('Error fetching places:', error);
    } else if (data) {
        setPlaces(data);
        processMedia(data);
    }
    setLoading(false);
  };

  const processMedia = (placesData: Place[]) => {
      const allMedia: MediaItem[] = [];
      placesData.forEach(place => {
          if (place.images) {
              place.images.forEach(url => allMedia.push({ url, type: 'image', placeId: place.id, placeName: place.name }));
          }
          if (place.videos) {
              place.videos.forEach(url => allMedia.push({ url, type: 'video', placeId: place.id, placeName: place.name }));
          }
      });
      setMediaItems(allMedia);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!uploadPlaceId) return alert('Please select a place to upload to first.');

    setUploading(true);
    const files = Array.from(e.target.files);
    const place = places.find(p => p.id.toString() === uploadPlaceId);
    if (!place) return;

    const newImages = [...(place.images || [])];
    const newVideos = [...(place.videos || [])];
    let hasChanges = false;

    try {
      for (const file of files) {
        const isVideo = file.type.startsWith('video/');
        const fileExt = file.name.split('.').pop();
        const fileName = `${isVideo ? 'videos' : 'images'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('places_media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('places_media')
          .getPublicUrl(fileName);

        if (isVideo) {
            newVideos.push(publicUrl);
        } else {
            newImages.push(publicUrl);
        }
        hasChanges = true;
      }

      if (hasChanges) {
          const { error } = await supabase
            .from('places')
            .update({ images: newImages, videos: newVideos })
            .eq('id', place.id);
            
          if (error) throw error;
          alert('Media uploaded successfully!');
          // Changes will be picked up by realtime subscription
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteMedia = async (item: MediaItem) => {
      if(!confirm('Are you sure you want to delete this file?')) return;
      
      const place = places.find(p => p.id === item.placeId);
      if(!place) return;

      const newImages = place.images?.filter(url => url !== item.url) || [];
      const newVideos = place.videos?.filter(url => url !== item.url) || [];

      // Optional: Delete from storage bucket too (omitted for safety/simplicity, logic can be added)

      const { error } = await supabase
        .from('places')
        .update({ images: newImages, videos: newVideos })
        .eq('id', place.id);

      if (error) {
          alert('Failed to delete media: ' + error.message);
      }
  };

  const filteredMedia = mediaItems.filter(item => {
      if (selectedPlaceId === 'all') return true;
      return item.placeId.toString() === selectedPlaceId;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Place Media Manager</h1>
           <p className="text-muted-foreground">
             Centralized hub to view and manage media across all places.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Upload Media</CardTitle>
              <CardDescription>
                Add new photos or videos to a specific place.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upload-place">Target Place</Label>
                 <Select value={uploadPlaceId} onValueChange={setUploadPlaceId}>
                  <SelectTrigger id="upload-place">
                    <SelectValue placeholder="Select a place..." />
                  </SelectTrigger>
                  <SelectContent>
                    {places.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 text-center border-2 border-dashed rounded-md p-8 hover:bg-muted/50 transition cursor-pointer relative">
                 <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                 <p className="text-sm text-muted-foreground">Click or drag files to upload</p>
                 <Input 
                    id="media-upload" 
                    type="file" 
                    multiple 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleFileUpload}
                    disabled={uploading || !uploadPlaceId}
                 />
              </div>
              {uploading && <p className="text-sm text-center text-yellow-600 animate-pulse">Uploading files...</p>}
            </CardContent>
          </Card>
          
          {/* Gallery Section */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                  <CardTitle>Media Gallery</CardTitle>
                  <CardDescription>
                    {filteredMedia.length} files found
                  </CardDescription>
              </div>
              <div className="w-[200px]">
                 <Select value={selectedPlaceId} onValueChange={setSelectedPlaceId}>
                  <SelectTrigger className="h-8">
                    <Filter className="w-3 h-3 mr-2"/>
                    <SelectValue placeholder="Filter by Place" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Places</SelectItem>
                    {places.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="mt-4">
               {loading ? (
                   <div className="text-center py-20 text-muted-foreground">Loading media library...</div>
               ) : filteredMedia.length === 0 ? (
                   <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">No media files found.</div>
               ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[150px]">
                    {filteredMedia.map((item, idx) => (
                      <div key={idx} className="group relative overflow-hidden rounded-lg border bg-muted">
                        {item.type === 'image' ? (
                            <Image
                              alt={item.placeName}
                              src={item.url}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                        ) : (
                             <div className="w-full h-full flex items-center justify-center bg-black">
                                <video src={item.url} className="w-full h-full object-cover opacity-70" />
                                <span className="absolute text-white font-bold text-xs uppercase border border-white px-2 py-0.5 rounded">Video</span>
                             </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2" >
                            <div className="flex justify-between items-end w-full">
                                <span className="text-white text-xs font-medium truncate w-[70%]">{item.placeName}</span>
                                <Button 
                                    size="icon" 
                                    variant="destructive" 
                                    className="h-6 w-6 rounded-full"
                                    onClick={() => handleDeleteMedia(item)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
               )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
