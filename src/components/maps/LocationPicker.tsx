'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import { useMapEvents } from 'react-leaflet';

// Leafletは動的インポートが必要(SSR回避)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export function LocationPicker({ onLocationSelect, initialLat = 35.6812, initialLng = 139.7671 }: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocationSelect = async (lat: number, lng: number) => {
    // 簡易的な住所取得(実際はNominatim APIなどを使用)
    setAddress(`緯度: ${lat.toFixed(6)}, 経度: ${lng.toFixed(6)}`);
    onLocationSelect(lat, lng, address);
  };

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">地図を読み込んでいます...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center text-sm text-muted-foreground mb-2">
        <MapPin className="w-4 h-4 mr-2" />
        <span>地図をクリックして集合場所を選択してください</span>
      </div>
      
      <div className="w-full h-[400px] rounded-lg overflow-hidden border">
        <MapContainer
          center={[initialLat, initialLng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onLocationSelect={handleLocationSelect} />
        </MapContainer>
      </div>

      {address && (
        <p className="text-sm text-muted-foreground">
          選択位置: {address}
        </p>
      )}
    </div>
  );
}