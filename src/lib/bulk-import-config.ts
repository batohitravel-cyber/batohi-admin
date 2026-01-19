
export const BULK_IMPORT_CONFIG: Record<string, any> = {
    places: {
        label: 'Places',
        table: 'places',
        columns: [
            'name',
            'description',
            'status',
            'latitude',
            'longitude',
            'trending',
            'unesco',
            'must_visit',
            'timings',
            'ticket_price',
            'distance_from_center',
            'story',
            'address_full',
            'address_city',
            'address_state',
            'address_pincode'
        ],
        demoData: [
            {
                name: 'Golghar',
                description: 'A massive granary built by Captain John Garstin.',
                status: 'Published',
                latitude: '25.6213',
                longitude: '85.1384',
                trending: 'true',
                unesco: 'false',
                must_visit: 'true',
                timings: '10 AM - 5 PM',
                ticket_price: '20',
                distance_from_center: '2 km',
                story: 'Built in 1786...',
                address_full: 'Ashok Rajpath, Patna',
                address_city: 'Patna',
                address_state: 'Bihar',
                address_pincode: '800001'
            },
            {
                name: 'Mahabodhi Temple',
                description: 'A UNESCO World Heritage Site.',
                status: 'Draft',
                latitude: '24.6961',
                longitude: '84.9913',
                trending: 'true',
                unesco: 'true',
                must_visit: 'true',
                timings: '5 AM - 9 PM',
                ticket_price: 'Free',
                distance_from_center: '0 km',
                story: 'Where Buddha attained enlightenment...',
                address_full: 'Bodh Gaya',
                address_city: 'Gaya',
                address_state: 'Bihar',
                address_pincode: '824231'
            }
        ],
        transform: (row: any) => {
            // transform handling for address bundling
            const {
                address_full,
                address_city,
                address_state,
                address_pincode,
                ...rest
            } = row;

            return {
                ...rest,
                // Convert boolean strings to booleans
                trending: String(row.trending).toLowerCase() === 'true',
                unesco: String(row.unesco).toLowerCase() === 'true',
                must_visit: String(row.must_visit).toLowerCase() === 'true',
                // Bundle address
                address: {
                    full: address_full,
                    city: address_city,
                    state: address_state,
                    pincode: address_pincode
                }
            };
        }
    },

    users: {
        label: 'App Users',
        table: 'mobile_app_users',
        columns: [
            'id',
            'email',
            'full_name',
            'status',
            'is_verified'
        ],
        demoData: [
            {
                id: 'user_123',
                email: 'user@example.com',
                full_name: 'John Doe',
                status: 'Active',
                is_verified: 'true'
            }
        ],
        transform: (row: any) => {
            return {
                ...row,
                is_verified: String(row.is_verified).toLowerCase() === 'true'
            };
        }
    },
    hotels: {
        label: 'Hotels',
        table: 'hotels',
        columns: [
            'name',
            'description',
            'hotel_type',
            'star_rating',
            'phone',
            'email',
            'website',
            'address',
            'city',
            'state',
            'price_per_night',
            'room_type',
            'total_rooms',
            'available_rooms',
            'amenities', // comma separated
            'status'
        ],
        demoData: [
            {
                name: 'Grand Hotel',
                description: 'Luxury stay in the heart of the city',
                hotel_type: 'Luxury',
                star_rating: '5',
                phone: '+919999999999',
                email: 'info@grandhotel.com',
                website: 'https://grandhotel.com',
                address: '123 Main St',
                city: 'Patna',
                state: 'Bihar',
                price_per_night: '5000',
                room_type: 'Deluxe',
                total_rooms: '100',
                available_rooms: '20',
                amenities: 'Wifi,Pool,Spa,Gym',
                status: 'Published'
            }
        ],
        transform: (row: any) => {
            return {
                ...row,
                star_rating: row.star_rating ? parseInt(row.star_rating) : null,
                total_rooms: row.total_rooms ? parseInt(row.total_rooms) : null,
                available_rooms: row.available_rooms ? parseInt(row.available_rooms) : null,
                price_per_night: row.price_per_night ? parseFloat(row.price_per_night) : null,
                amenities: row.amenities ? row.amenities.split(',').map((s: string) => s.trim()) : [],
            };
        }
    },
    vehicles: {
        label: 'Vehicles',
        table: 'vehicles',
        columns: [
            'vehicle_name',
            'vehicle_type',
            'brand',
            'model',
            'manufacture_year',
            'registration_number',
            'color',
            'seating_capacity',
            'fuel_type',
            'price_per_km',
            'base_fare',
            'availability_status'
        ],
        demoData: [
            {
                vehicle_name: 'Innova Crysta',
                vehicle_type: 'SUV',
                brand: 'Toyota',
                model: 'Crysta',
                manufacture_year: '2023',
                registration_number: 'BR01AB1234',
                color: 'White',
                seating_capacity: '7',
                fuel_type: 'Diesel',
                price_per_km: '15',
                base_fare: '500',
                availability_status: 'available'
            }
        ],
        transform: (row: any) => {
            return {
                ...row,
                manufacture_year: row.manufacture_year ? parseInt(row.manufacture_year) : null,
                seating_capacity: row.seating_capacity ? parseInt(row.seating_capacity) : null,
                price_per_km: row.price_per_km ? parseFloat(row.price_per_km) : null,
                base_fare: row.base_fare ? parseFloat(row.base_fare) : null,
            };
        }
    },
    audio_stories: {
        label: 'Audio Stories',
        table: 'audio_stories',
        columns: [
            'title',
            'description',
            'audio_url',
            'language',
            'transcript',
            'status',
            'place_id' // Optional, strictly needs valid foreign key if provided
        ],
        demoData: [
            {
                title: 'History of Golghar',
                description: 'An audio guide explaining the history.',
                audio_url: 'https://example.com/audio.mp3',
                language: 'English',
                transcript: 'This is the transcript...',
                status: 'Published',
                place_id: ''
            }
        ],
        transform: (row: any) => {
            return {
                ...row,
                place_id: row.place_id ? parseInt(row.place_id) : null
            };
        }
    },
    restaurants: {
        label: 'Restaurants',
        table: 'restaurants',
        columns: [
            'name',
            'address',
            'latitude',
            'longitude',
            'rating',
            'price_category',
            'must_try_dishes', // comma separated
            'status'
        ],
        demoData: [
            {
                name: 'Bansi Vihar',
                address: 'Fraser Road, Patna',
                latitude: '25.61',
                longitude: '85.14',
                rating: '4.5',
                price_category: 'mid-range',
                must_try_dishes: 'Masala Dosa,Idli',
                status: 'Draft'
            }
        ],
        transform: (row: any) => {
            return {
                ...row,
                latitude: row.latitude ? parseFloat(row.latitude) : null,
                longitude: row.longitude ? parseFloat(row.longitude) : null,
                rating: row.rating ? parseFloat(row.rating) : null,
                must_try_dishes: row.must_try_dishes ? row.must_try_dishes.split(',').map((s: string) => s.trim()) : [],
            };
        }
    },
    festivals: {
        label: 'Festivals',
        table: 'festivals',
        columns: [
            'name',
            'description',
            'start_date',
            'end_date',
            'location',
            'status',
            'is_featured'
        ],
        demoData: [
            {
                name: 'Chhath Puja',
                description: 'A major Hindu festival aimed at the Sun God.',
                start_date: '2025-10-26',
                end_date: '2025-10-29',
                location: 'Bihar',
                status: 'Draft',
                is_featured: 'true'
            }
        ],
        transform: (row: any) => {
            return {
                ...row,
                is_featured: String(row.is_featured).toLowerCase() === 'true'
            };
        }
    }
};
