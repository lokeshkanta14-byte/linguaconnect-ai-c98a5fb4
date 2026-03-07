import { MapPin, ExternalLink } from "lucide-react";

interface LocationCardProps {
  lat: number;
  lng: number;
  sent: boolean;
}

const LocationCard = ({ lat, lng, sent }: LocationCardProps) => {
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=280x120&markers=color:red%7C${lat},${lng}&key=`;

  return (
    <div className="rounded-xl overflow-hidden">
      {/* Map preview fallback with gradient */}
      <div className="relative h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
            backgroundSize: '12px 12px'
          }} />
        </div>
        <div className="relative flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-destructive/90 flex items-center justify-center shadow-md">
            <MapPin className="w-5 h-5 text-destructive-foreground" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">📍 Shared Location</span>
        </div>
      </div>

      <div className="px-3 py-2 space-y-1.5">
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Lat: {lat.toFixed(4)}</span>
          <span>Lng: {lng.toFixed(4)}</span>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-medium transition-colors ${
            sent
              ? "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open in Google Maps
        </a>
      </div>
    </div>
  );
};

export default LocationCard;
