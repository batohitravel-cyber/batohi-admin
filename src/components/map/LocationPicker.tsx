'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

// Fix marker icons (Next.js)
// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Patna Center
const DEFAULT_CENTER: [number, number] = [25.61, 85.14];
const DEFAULT_ZOOM = 13;

interface LocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ position, setPosition, onSelect }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void, onSelect: (lat: number, lng: number) => void }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position ? <Marker position={position} /> : null;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function LocationPicker({ initialLat, initialLng, onLocationSelect }: LocationPickerProps) {
    // Initialize position from props if available
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const [viewState, setViewState] = useState<{ center: [number, number], zoom: number }>({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM
    });

    // Update internal state when initial props change (e.g. editing mode)
    useEffect(() => {
        if (initialLat && initialLng) {
            const newPos = new L.LatLng(initialLat, initialLng);
            setPosition(newPos);
            setViewState({ center: [initialLat, initialLng], zoom: 16 });
        }
    }, [initialLat, initialLng]);

    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        setLoading(true);
        try {
            // Use Photon API for search (faster, better POI support)
            // Note: Photon returns GeoJSON [lon, lat]
            const searchQuery = query.toLowerCase().includes('bihar') ? query : `${query}, Bihar`;

            const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();

            if (data && data.features && data.features.length > 0) {
                const first = data.features[0];
                const [lon, lat] = first.geometry.coordinates; // GeoJSON is [lon, lat]

                const newPos = new L.LatLng(lat, lon);
                setPosition(newPos);
                onLocationSelect(lat, lon);
                setViewState({ center: [lat, lon], zoom: 16 });
            } else {
                alert('Location not found in Bihar region. Try adding specific details.');
            }
        } catch (err) {
            console.error(err);
            alert('Error searching location');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search place (e.g. Marine Drive, Golghar)"
                    className="flex-1"
                />
                <Button type="button" onClick={handleSearch} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
                </Button>
            </div>

            <div className="h-[250px] w-full rounded-md overflow-hidden border relative z-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <MapContainer
                    key="admin-map"
                    center={DEFAULT_CENTER}
                    zoom={DEFAULT_ZOOM}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <ChangeView center={viewState.center} zoom={viewState.zoom} />
                    <LocationMarker
                        position={position}
                        setPosition={setPosition}
                        onSelect={onLocationSelect}
                    />
                </MapContainer>
            </div>

            <div className="flex justify-between items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                <span>Selected Coordinates:</span>
                <div className="flex gap-4 font-mono">
                    <span>Lat: {position ? position.lat.toFixed(6) : 'Not set'}</span>
                    <span>Lng: {position ? position.lng.toFixed(6) : 'Not set'}</span>
                </div>
            </div>
        </div>
    );
}
