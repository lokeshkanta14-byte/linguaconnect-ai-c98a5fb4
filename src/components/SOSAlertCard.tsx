import { Shield, ExternalLink } from "lucide-react";

interface SOSAlertCardProps {
  location?: string;
  time: string;
}

const SOSAlertCard = ({ location, time }: SOSAlertCardProps) => {
  const mapsUrl = location || null;

  return (
    <div className="flex justify-center mb-2.5 animate-fade-in">
      <div className="max-w-[85%] rounded-2xl overflow-hidden border-2 border-destructive/30 shadow-soft">
        <div className="bg-destructive/10 px-4 py-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-destructive" />
          <span className="text-sm font-bold text-destructive">🚨 EMERGENCY ALERT</span>
        </div>
        <div className="bg-card px-4 py-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            The user may be in danger. An SOS alert was sent to emergency contacts.
          </p>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Location in Google Maps
            </a>
          )}
          <p className="text-[10px] text-muted-foreground text-right">{time}</p>
        </div>
      </div>
    </div>
  );
};

export default SOSAlertCard;
