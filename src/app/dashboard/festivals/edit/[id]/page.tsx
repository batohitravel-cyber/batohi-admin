'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect, use } from 'react';
import type { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, UploadCloud } from 'lucide-react';
import { parseISO } from 'date-fns';

export default function EditFestivalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [currentImages, setCurrentImages] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        async function fetchFestival() {
            const { data, error } = await supabase.from('festivals').select('*').eq('id', id).single();
            if (error) {
                console.error(error);
                router.push('/dashboard/festivals');
                return;
            }

            setName(data.name);
            setDescription(data.description || '');
            setLocation(data.location || '');
            if (data.start_date) {
                setDateRange({
                    from: parseISO(data.start_date),
                    to: data.end_date ? parseISO(data.end_date) : parseISO(data.start_date)
                });
            }
            setCurrentImages(data.images || []);
            setFetching(false);
        }
        fetchFestival();
    }, [id, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const uploadImages = async () => {
        const urls: string[] = [];
        for (const file of files) {
            const fileName = `fest-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            const { error } = await supabase.storage.from('festivals-media').upload(fileName, file);
            if (error) {
                console.error('Upload failed', error);
                continue;
            }
            const { data } = supabase.storage.from('festivals-media').getPublicUrl(fileName);
            urls.push(data.publicUrl);
        }
        return urls;
    };

    const handleSubmit = async () => {
        if (!name || !dateRange?.from) {
            alert('Name and Start Date are required.');
            return;
        }

        setLoading(true);
        try {
            const newImageUrls = await uploadImages();
            const finalImages = [...currentImages, ...newImageUrls];

            const payload = {
                name,
                description,
                location,
                start_date: dateRange.from.toISOString(),
                end_date: dateRange.to ? dateRange.to.toISOString() : dateRange.from.toISOString(),
                images: finalImages
            };

            const { error } = await supabase.from('festivals').update(payload).eq('id', id);
            if (error) throw error;

            router.push('/dashboard/festivals');
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Festival</h1>
                    <p className="text-muted-foreground">
                        Update festival details.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/festivals">Cancel</Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Festival Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    className="min-h-[150px]"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Media Gallery</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            {currentImages.length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                    {currentImages.map((img, i) => (
                                        <img key={i} src={img} className="h-20 w-20 object-cover rounded-md border" />
                                    ))}
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="photos">Add Details Photos</Label>
                                <Input id="photos" type="file" multiple accept="image/*" onChange={handleFileChange} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 flex flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Festival Dates *</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={1}
                                className="rounded-md border"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/festivals">Cancel</Link>
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    Update Festival
                </Button>
            </div>
        </div>
    );
}
