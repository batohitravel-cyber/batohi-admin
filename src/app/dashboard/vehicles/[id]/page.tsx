'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getVehicleById, updateVehicle } from '@/lib/vehicles-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditVehiclePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        vehicle_name: '',
        vehicle_type: 'Sedan',
        brand: '',
        model: '',
        manufacture_year: new Date().getFullYear(),
        registration_number: '',
        color: '',
        seating_capacity: 4,
        luggage_capacity: 2,
        fuel_type: 'Petrol',
        price_per_km: '',
        price_per_hour: '',
        base_fare: '',
        availability_status: 'available',
        is_active: true
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            const { vehicle, error } = await getVehicleById(id);

            if (error) {
                toast({
                    title: "Error fetching vehicle",
                    description: error,
                    variant: "destructive",
                });
                router.push('/dashboard/vehicles');
                return;
            }

            if (vehicle) {
                setFormData({
                    vehicle_name: vehicle.vehicle_name,
                    vehicle_type: vehicle.vehicle_type,
                    brand: vehicle.brand || '',
                    model: vehicle.model || '',
                    manufacture_year: vehicle.manufacture_year || new Date().getFullYear(),
                    registration_number: vehicle.registration_number,
                    color: vehicle.color || '',
                    seating_capacity: vehicle.seating_capacity,
                    luggage_capacity: vehicle.luggage_capacity || 0,
                    fuel_type: vehicle.fuel_type || 'Petrol',
                    price_per_km: vehicle.price_per_km || '',
                    price_per_hour: vehicle.price_per_hour || '',
                    base_fare: vehicle.base_fare || '',
                    availability_status: vehicle.availability_status || 'available',
                    is_active: vehicle.is_active
                });
            }
            setLoading(false);
        };

        fetchData();
    }, [id, router, toast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const result = await updateVehicle(id, formData);

            if (result.success) {
                toast({
                    title: "Vehicle Updated",
                    description: "Vehicle details updated successfully.",
                });
                router.push('/dashboard/vehicles');
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to update vehicle",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/vehicles">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Vehicle details</h1>
                    <p className="text-muted-foreground">Manage transportation options.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Vehicle Details</CardTitle>
                        <CardDescription>
                            Basic information about the vehicle.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="vehicle_name">Vehicle Name / Title *</Label>
                                <Input
                                    id="vehicle_name"
                                    name="vehicle_name"
                                    value={formData.vehicle_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vehicle_type">Vehicle Type</Label>
                                <Select
                                    value={formData.vehicle_type}
                                    onValueChange={(val) => handleSelectChange('vehicle_type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sedan">Sedan</SelectItem>
                                        <SelectItem value="SUV">SUV</SelectItem>
                                        <SelectItem value="Hatchback">Hatchback</SelectItem>
                                        <SelectItem value="Minivan">Minivan</SelectItem>
                                        <SelectItem value="Luxury">Luxury</SelectItem>
                                        <SelectItem value="Bus">Bus</SelectItem>
                                        <SelectItem value="Traveller">Traveller</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="registration_number">Registration Number *</Label>
                                <Input
                                    id="registration_number"
                                    name="registration_number"
                                    value={formData.registration_number}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
                                <Input
                                    id="brand"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="color">Color</Label>
                                <Input
                                    id="color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="manufacture_year">Manufacture Year</Label>
                                <Input
                                    id="manufacture_year"
                                    name="manufacture_year"
                                    type="number"
                                    value={formData.manufacture_year}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fuel_type">Fuel Type</Label>
                                <Select
                                    value={formData.fuel_type}
                                    onValueChange={(val) => handleSelectChange('fuel_type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select fuel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Petrol">Petrol</SelectItem>
                                        <SelectItem value="Diesel">Diesel</SelectItem>
                                        <SelectItem value="CNG">CNG</SelectItem>
                                        <SelectItem value="Electric">Electric</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Capacity & Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="seating_capacity">Seating Capacity</Label>
                                <Input
                                    id="seating_capacity"
                                    name="seating_capacity"
                                    type="number"
                                    value={formData.seating_capacity}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="luggage_capacity">Luggage Capacity (Bags)</Label>
                                <Input
                                    id="luggage_capacity"
                                    name="luggage_capacity"
                                    type="number"
                                    value={formData.luggage_capacity}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price_per_km">Price per KM (₹)</Label>
                                <Input
                                    id="price_per_km"
                                    name="price_per_km"
                                    type="number"
                                    step="0.01"
                                    value={formData.price_per_km}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price_per_hour">Price per Hour (₹)</Label>
                                <Input
                                    id="price_per_hour"
                                    name="price_per_hour"
                                    type="number"
                                    step="0.01"
                                    value={formData.price_per_hour}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="base_fare">Base Fare (₹)</Label>
                                <Input
                                    id="base_fare"
                                    name="base_fare"
                                    type="number"
                                    step="0.01"
                                    value={formData.base_fare}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="availability_status">Status</Label>
                            <Select
                                value={formData.availability_status}
                                onValueChange={(val) => handleSelectChange('availability_status', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="booked">Booked</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="offline">Offline</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Link href="/dashboard/vehicles">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
